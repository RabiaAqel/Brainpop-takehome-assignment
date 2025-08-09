<?php

namespace App\Repositories;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Database\Eloquent\Collection;
use App\Repositories\Interfaces\QuizRepositoryInterface;

class QuizRepository implements QuizRepositoryInterface
{
    /**
     * Get all quizzes.
     *
     * @return Collection
     */
    public function getAllQuizzes(): Collection
    {
        return Quiz::all();
    }

    /**
     * Get a quiz by ID.
     *
     * @param int $quizId
     * @return Quiz|null
     */
    public function getQuizById(int $quizId): ?Quiz
    {
        return Quiz::find($quizId);
    }

    /**
     * Get a quiz with its questions and options.
     *
     * @param int $quizId
     * @return Quiz|null
     */
    public function getQuizWithQuestions(int $quizId): ?Quiz
    {
        return Quiz::with('questions.options')->find($quizId);
    }

    /**
     * Get questions for a specific quiz.
     *
     * @param int $quizId
     * @return Collection
     */
    public function getQuizQuestions(int $quizId): Collection
    {
        return Quiz::findOrFail($quizId)->questions()->with('options')->get();
    }

    /**
     * Get the latest submitted attempt for a user and quiz.
     *
     * @param int $quizId
     * @param int $userId
     * @return QuizAttempt|null
     */
    public function getLatestSubmittedAttempt(int $quizId, int $userId): ?QuizAttempt
    {
        return QuizAttempt::where('user_id', $userId)
            ->where('quiz_id', $quizId)
            ->where('is_submitted', true)
            ->latest()
            ->first();
    }

    /**
     * Get an attempt by ID with relationships loaded.
     *
     * @param int $attemptId
     * @return QuizAttempt|null
     */
    public function getAttemptWithRelations(int $attemptId): ?QuizAttempt
    {
        return QuizAttempt::with(['quiz', 'userAnswers.question.options'])
            ->find($attemptId);
    }

    /**
     * Get unsubmitted attempts for a user and quiz.
     *
     * @param int $userId
     * @param int $quizId
     * @return Collection
     */
    public function getUnsubmittedAttempts(int $userId, int $quizId): Collection
    {
        return QuizAttempt::where('user_id', $userId)
            ->where('quiz_id', $quizId)
            ->where('is_submitted', false)
            ->get();
    }

    /**
     * Count questions for a quiz.
     *
     * @param int $quizId
     * @return int
     */
    public function getQuestionCount(int $quizId): int
    {
        return Quiz::findOrFail($quizId)->questions()->count();
    }
}
