<?php

namespace App\Services;

use App\Models\QuizAttempt;

class ScoringService
{
    /**
     * Calculate the score for a completed quiz attempt.
     *
     * @param QuizAttempt $attempt
     * @return array
     */
    public function calculateScore(QuizAttempt $attempt): array
    {
        $quiz = $attempt->quiz;
        $userAnswers = $attempt->userAnswers;
        $totalQuestions = $quiz->questions()->count();
        $correctCount = 0;
        $answersSummary = [];

        foreach ($quiz->questions as $question) {
            $userAnswer = $userAnswers->where('question_id', $question->id)->first();
            $correctOption = $question->options->where('is_correct', true)->first();
            $isCorrect = $userAnswer && $userAnswer->option_id == ($correctOption->id ?? null);
            
            if ($isCorrect) {
                $correctCount++;
            }

            $answersSummary[] = [
                'question_id' => $question->id,
                'question_text' => $question->text,
                'selected_option_id' => $userAnswer->option_id ?? null,
                'selected_option_text' => $userAnswer && $userAnswer->option ? $userAnswer->option->text : null,
                'is_correct' => $isCorrect,
                'correct_option_id' => $correctOption->id ?? null,
                'correct_option_text' => $correctOption->text ?? null,
            ];
        }

        return [
            'total_questions' => $totalQuestions,
            'correct_answers' => $correctCount,
            'percentage' => $totalQuestions > 0 ? round(($correctCount / $totalQuestions) * 100, 2) : 0,
            'answers' => $answersSummary,
        ];
    }

    /**
     * Format the submission response with score data.
     *
     * @param QuizAttempt $attempt
     * @param array $scoreData
     * @return array
     */
    public function formatSubmissionResponse(QuizAttempt $attempt, array $scoreData): array
    {
        return [
            'attempt_id' => $attempt->id,
            'quiz_id' => $attempt->quiz_id,
            'user_id' => $attempt->user_id,
            'status' => 'submitted',
            'total_questions' => $scoreData['total_questions'],
            'correct_answers' => $scoreData['correct_answers'],
            'percentage' => $scoreData['percentage'],
            'answers' => $scoreData['answers'],
        ];
    }
} 