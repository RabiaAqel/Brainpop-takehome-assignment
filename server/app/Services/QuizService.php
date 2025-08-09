<?php

namespace App\Services;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Repositories\Interfaces\QuizRepositoryInterface;
use App\Repositories\QuizAttemptRepository;
use App\Exceptions\QuizException;

class QuizService
{
    public function __construct(
        private ScoringService $scoringService,
        private QuizRepositoryInterface $quizRepository,
        private QuizAttemptRepository $quizAttemptRepository
    ) {}

    /**
     * Start a new quiz attempt for a user.
     *
     * @param int $userId
     * @param int $quizId
     * @return QuizAttempt
     * @throws QuizException
     */
    public function startQuizAttempt(int $userId, int $quizId): QuizAttempt
    {
        // Clean up any existing unsubmitted attempts for this user and quiz
        $this->cleanupUnsubmittedAttempts($userId, $quizId);
        
        // Create new attempt
        return $this->quizAttemptRepository->createAttempt([
            'user_id' => $userId,
            'quiz_id' => $quizId,
            'started_at' => now(),
        ]);
    }

    /**
     * Submit a quiz attempt and calculate the score.
     *
     * @param int $attemptId
     * @param int $userId
     * @return array
     * @throws QuizException
     */
    public function submitAttempt(int $attemptId, int $userId): array
    {
        $attempt = $this->quizAttemptRepository->getAttemptWithRelations($attemptId);

        if (!$attempt) {
            throw new QuizException('Quiz attempt not found', 404, 'ATTEMPT_NOT_FOUND');
        }

        // Authorization check
        if ($attempt->user_id !== $userId) {
            throw new QuizException('Unauthorized access to quiz attempt', 403, 'UNAUTHORIZED_ACCESS');
        }

        // If already submitted, return existing results
        if ($attempt->is_submitted) {
            $scoreData = $this->scoringService->calculateScore($attempt);
            return $this->scoringService->formatSubmissionResponse($attempt, $scoreData);
        }

        // Mark as submitted
        $this->quizAttemptRepository->markAsSubmitted($attemptId);

        // Reload the attempt to get updated data
        $attempt = $this->quizAttemptRepository->getAttemptWithRelations($attemptId);

        // Calculate score
        $scoreData = $this->scoringService->calculateScore($attempt);
        
        return $this->scoringService->formatSubmissionResponse($attempt, $scoreData);
    }

    /**
     * Get quiz results for a user.
     *
     * @param Quiz $quiz
     * @param int $userId
     * @return array
     * @throws QuizException
     */
    public function getQuizResults(Quiz $quiz, int $userId): array
    {
        // Get the user's latest submitted attempt for this quiz
        $attempt = $this->quizRepository->getLatestSubmittedAttempt($quiz->id, $userId);

        if (!$attempt) {
            throw new QuizException('No completed attempts found for this quiz', 404, 'NO_COMPLETED_ATTEMPTS');
        }

        $attempt->load(['userAnswers.option']);
        $totalQuestions = $this->quizRepository->getQuestionCount($quiz->id);
        $correctAnswers = $attempt->userAnswers->filter(fn($ua) => $ua->option?->is_correct)->count();

        return [
            'quiz_id' => $quiz->id,
            'user_id' => $userId,
            'total_questions' => $totalQuestions,
            'correct_answers' => $correctAnswers,
            'options' => $attempt->userAnswers->map(fn($ua) => [
                'question_id' => $ua->question_id,
                'option_id' => $ua->option_id,
                'is_correct' => (bool) ($ua->option->is_correct ?? false),
            ]),
        ];
    }

    /**
     * Safely get quiz results for a user with error handling.
     *
     * @param Quiz $quiz
     * @param int $userId
     * @return array
     */
    public function getQuizResultsSafely(Quiz $quiz, int $userId): array
    {
        try {
            return $this->getQuizResults($quiz, $userId);
        } catch (QuizException $e) {
            return [
                'error' => true,
                'message' => $e->getMessage(),
                'status_code' => $e->getStatusCode()
            ];
        }
    }

    /**
     * Format quiz data for display.
     *
     * @param Quiz $quiz
     * @return array
     */
    public function formatQuizForDisplay(Quiz $quiz): array
    {
        return [
            'id' => $quiz->id,
            'title' => $quiz->title,
            'description' => $quiz->description,
            'total_questions' => $this->quizRepository->getQuestionCount($quiz->id),
            'created_at' => $quiz->created_at,
            'updated_at' => $quiz->updated_at
        ];
    }

    /**
     * Format start attempt response.
     *
     * @param QuizAttempt $attempt
     * @param array $userAnswers
     * @return array
     */
    public function formatStartAttemptResponse(QuizAttempt $attempt, array $userAnswers): array
    {
        return [
            'attempt_id' => $attempt->id,
            'status' => 'in-progress',
            'user_answers' => $userAnswers,
        ];
    }

    /**
     * Clean up any unsubmitted attempts for a user and quiz.
     *
     * @param int $userId
     * @param int $quizId
     * @return void
     */
    private function cleanupUnsubmittedAttempts(int $userId, int $quizId): void
    {
        $this->quizAttemptRepository->deleteUnsubmittedAttempts($userId, $quizId);
    }
} 