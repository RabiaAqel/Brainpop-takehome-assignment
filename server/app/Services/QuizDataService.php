<?php

namespace App\Services;

use App\Models\Quiz;
use App\Repositories\Interfaces\QuizRepositoryInterface;
use App\Http\Resources\QuizResource;
use App\Http\Resources\QuestionResource;
use Illuminate\Http\JsonResponse;

class QuizDataService
{
    public function __construct(
        private QuizRepositoryInterface $quizRepository
    ) {}

    /**
     * Get all quizzes formatted for API response.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function getAllQuizzes()
    {
        $quizzes = $this->quizRepository->getAllQuizzes();
        return QuizResource::collection($quizzes);
    }

    /**
     * Get quiz details formatted for API response.
     *
     * @param Quiz $quiz
     * @return array
     */
    public function getQuizDetails(Quiz $quiz): array
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
     * Get quiz questions formatted for API response.
     *
     * @param Quiz $quiz
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function getQuizQuestions(Quiz $quiz)
    {
        $questions = $this->quizRepository->getQuizQuestions($quiz->id);
        return QuestionResource::collection($questions);
    }
}
