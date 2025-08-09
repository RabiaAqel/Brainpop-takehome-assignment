<?php

namespace App\Services;

use App\Repositories\UserAnswerRepository;
use App\Repositories\QuizAttemptRepository;
use Illuminate\Support\Collection;
use App\Models\QuizAttempt;
use App\Exceptions\QuizException;

class UserAnswerService
{
    public function __construct(
        private UserAnswerRepository $userAnswerRepository,
        private QuizAttemptRepository $quizAttemptRepository
    ) {}

    /**
     * Save a user's answer for a question.
     *
     * @param array $data
     * @param int $attemptId
     * @return array
     * @throws QuizException
     */
    public function saveAnswer(array $data, int $attemptId): array
    {
        // Verify the attempt exists and belongs to the user
        $attempt = $this->quizAttemptRepository->findByIdOrFail($attemptId);
        
        if (!$attempt) {
            throw new QuizException('Quiz attempt not found', 404, 'ATTEMPT_NOT_FOUND');
        }
        
        if ($attempt->user_id !== $data['user_id']) {
            throw new QuizException('Unauthorized access to quiz attempt', 403, 'UNAUTHORIZED_ACCESS');
        }

        // Check if attempt is already submitted
        if ($attempt->is_submitted) {
            throw new QuizException('Cannot modify answers for a submitted quiz attempt', 400, 'ATTEMPT_ALREADY_SUBMITTED');
        }

        // Save the answer
        $this->userAnswerRepository->saveAnswer([
            'user_id' => $data['user_id'],
            'quiz_id' => $attempt->quiz_id,
            'quiz_attempt_id' => $attemptId,
            'question_id' => $data['question_id'],
            'option_id' => $data['selected_option_id'],
        ]);

        // Check if all questions have been answered and auto-submit if so
        $this->checkAndAutoSubmit($attempt);

        return ['message' => 'Answer saved successfully.'];
    }

    /**
     * Check if all questions have been answered and auto-submit the attempt.
     *
     * @param QuizAttempt $attempt
     * @return void
     */
    private function checkAndAutoSubmit(QuizAttempt $attempt): void
    {
        // Get total questions for this quiz
        $totalQuestions = $attempt->quiz->questions()->count();
        
        // Get answered questions count
        $answeredQuestions = $this->userAnswerRepository->getUserAnswersForAttempt($attempt->id)->count();
        
        // If all questions are answered and attempt is not yet submitted, auto-submit
        if ($answeredQuestions >= $totalQuestions && !$attempt->is_submitted) {
            $this->quizAttemptRepository->markAsSubmitted($attempt->id);
        }
    }

    /**
     * Get user answers for a specific attempt.
     *
     * @param int $attemptId
     * @return Collection
     */
    public function getUserAnswersForAttempt(int $attemptId): Collection
    {
        return $this->userAnswerRepository->getUserAnswersForAttempt($attemptId);
    }

    /**
     * Get user answers with option details for a specific attempt.
     *
     * @param int $attemptId
     * @return Collection
     */
    public function getUserAnswersWithOptions(int $attemptId): Collection
    {
        return $this->userAnswerRepository->getUserAnswersWithOptions($attemptId);
    }

    /**
     * Format user answers for API response.
     *
     * @param Collection $userAnswers
     * @return array
     */
    public function formatUserAnswersForResponse(Collection $userAnswers): array
    {
        return $userAnswers->map(function($ua) {
            return [
                'question_id' => $ua->question_id,
                'selected_option_id' => $ua->option_id,
            ];
        })->toArray();
    }

    /**
     * Delete all answers for a specific attempt.
     *
     * @param int $attemptId
     * @return bool
     */
    public function deleteAnswersForAttempt(int $attemptId): bool
    {
        return $this->userAnswerRepository->deleteAnswersForAttempt($attemptId);
    }
}
