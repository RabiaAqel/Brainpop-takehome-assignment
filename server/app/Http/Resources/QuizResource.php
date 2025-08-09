<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\QuestionResource;

class QuizResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'question_count' => $this->questions->count(),
            'questions' => $this->questions->map(function ($question) {
                return [
                    'id' => $question->id,
                    'text' => $question->text,
                    'options' => $question->options->map(function ($option) {
                        return [
                            'id' => $option->id,
                            'text' => $option->text,
                        ];
                    }),
                ];
            }),
        ];
    }
}
