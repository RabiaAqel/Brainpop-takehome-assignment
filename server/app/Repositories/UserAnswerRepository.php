<?php

namespace App\Repositories;

use App\Models\UserAnswer;
use Illuminate\Database\Eloquent\Collection;

class UserAnswerRepository
{
    /**
     * Save or update a user's answer.
     *
     * @param array $data
     * @return UserAnswer
     */
    public function saveAnswer(array $data): UserAnswer
    {
        return UserAnswer::updateOrCreate(
            [
                'user_id' => $data['user_id'],
                'quiz_id' => $data['quiz_id'],
                'quiz_attempt_id' => $data['quiz_attempt_id'],
                'question_id' => $data['question_id'],
            ],
            [
                'option_id' => $data['option_id'],
            ]
        );
    }

    /**
     * Get user answers for a specific attempt.
     *
     * @param int $attemptId
     * @return Collection
     */
    public function getUserAnswersForAttempt(int $attemptId): Collection
    {
        return UserAnswer::where('quiz_attempt_id', $attemptId)->get();
    }

    /**
     * Get user answers with option details for a specific attempt.
     *
     * @param int $attemptId
     * @return Collection
     */
    public function getUserAnswersWithOptions(int $attemptId): Collection
    {
        return UserAnswer::with('option')
            ->where('quiz_attempt_id', $attemptId)
            ->get();
    }

    /**
     * Get user answers for a specific quiz attempt and question.
     *
     * @param int $attemptId
     * @param int $questionId
     * @return UserAnswer|null
     */
    public function getUserAnswerForQuestion(int $attemptId, int $questionId): ?UserAnswer
    {
        return UserAnswer::where('quiz_attempt_id', $attemptId)
            ->where('question_id', $questionId)
            ->first();
    }

    /**
     * Delete user answers for a specific attempt.
     *
     * @param int $attemptId
     * @return bool
     */
    public function deleteAnswersForAttempt(int $attemptId): bool
    {
        return UserAnswer::where('quiz_attempt_id', $attemptId)->delete();
    }
}
