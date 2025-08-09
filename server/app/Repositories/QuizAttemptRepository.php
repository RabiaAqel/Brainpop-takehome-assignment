<?php

namespace App\Repositories;

use App\Models\QuizAttempt;
use Illuminate\Database\Eloquent\Collection;

class QuizAttemptRepository
{
    /**
     * Create a new quiz attempt.
     *
     * @param array $data
     * @return QuizAttempt
     */
    public function createAttempt(array $data): QuizAttempt
    {
        return QuizAttempt::create($data);
    }

    /**
     * Find a quiz attempt by ID.
     *
     * @param int $attemptId
     * @return QuizAttempt|null
     */
    public function findById(int $attemptId): ?QuizAttempt
    {
        return QuizAttempt::find($attemptId);
    }

    /**
     * Find a quiz attempt by ID or fail.
     *
     * @param int $attemptId
     * @return QuizAttempt
     */
    public function findByIdOrFail(int $attemptId): QuizAttempt
    {
        return QuizAttempt::with('quiz')->findOrFail($attemptId);
    }

    /**
     * Get active (unsubmitted) attempts for a user and quiz.
     *
     * @param int $userId
     * @param int $quizId
     * @return Collection
     */
    public function getActiveAttempts(int $userId, int $quizId): Collection
    {
        return QuizAttempt::where('user_id', $userId)
            ->where('quiz_id', $quizId)
            ->where('is_submitted', false)
            ->get();
    }

    /**
     * Delete unsubmitted attempts for a user and quiz.
     *
     * @param int $userId
     * @param int $quizId
     * @return int
     */
    public function deleteUnsubmittedAttempts(int $userId, int $quizId): int
    {
        return QuizAttempt::where('user_id', $userId)
            ->where('quiz_id', $quizId)
            ->where('is_submitted', false)
            ->delete();
    }

    /**
     * Update an attempt as submitted.
     *
     * @param int $attemptId
     * @return bool
     */
    public function markAsSubmitted(int $attemptId): bool
    {
        return QuizAttempt::where('id', $attemptId)->update([
            'is_submitted' => true,
            'submitted_at' => now(),
        ]);
    }

    /**
     * Get an attempt with all necessary relationships loaded.
     *
     * @param int $attemptId
     * @return QuizAttempt|null
     */
    public function getAttemptWithRelations(int $attemptId): ?QuizAttempt
    {
        return QuizAttempt::with(['quiz', 'userAnswers.question.options'])
            ->find($attemptId);
    }
}
