<?php

namespace App\Repositories\Interfaces;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Database\Eloquent\Collection;

interface QuizRepositoryInterface
{
    public function getAllQuizzes(): Collection;
    public function getQuizById(int $quizId): ?Quiz;
    public function getQuizWithQuestions(int $quizId): ?Quiz;
    public function getQuizQuestions(int $quizId): Collection;
    public function getLatestSubmittedAttempt(int $quizId, int $userId): ?QuizAttempt;
    public function getAttemptWithRelations(int $attemptId): ?QuizAttempt;
    public function getUnsubmittedAttempts(int $userId, int $quizId): Collection;
    public function getQuestionCount(int $quizId): int;
}
