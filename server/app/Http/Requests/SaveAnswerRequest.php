<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Models\QuizAttempt;
use App\Models\Question;
use App\Models\Option;
use App\Services\ApiResponseService;

class SaveAnswerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $attemptId = $this->route('attempt_id');
        $attempt = QuizAttempt::find($attemptId);
        
        // Check if attempt exists, belongs to user, and is not submitted
        return $attempt && 
               $attempt->user_id === auth()->id() && 
               !$attempt->is_submitted;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'question_id' => [
                'required',
                'integer',
                'exists:questions,id',
                function ($attribute, $value, $fail) {
                    $this->validateQuestionBelongsToQuiz($value, $fail);
                }
            ],
            'selected_option_id' => [
                'required',
                'integer',
                'exists:options,id',
                function ($attribute, $value, $fail) {
                    $this->validateOptionBelongsToQuestion($value, $fail);
                }
            ]
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'question_id.required' => 'Question ID is required.',
            'question_id.exists' => 'The selected question does not exist.',
            'selected_option_id.required' => 'An option must be selected.',
            'selected_option_id.exists' => 'The selected option does not exist.',
        ];
    }

    /**
     * Validate that the question belongs to the quiz of this attempt.
     */
    private function validateQuestionBelongsToQuiz($questionId, $fail)
    {
        $attemptId = $this->route('attempt_id');
        $attempt = QuizAttempt::find($attemptId);
        
        if ($attempt) {
            $questionExists = Question::where('id', $questionId)
                ->where('quiz_id', $attempt->quiz_id)
                ->exists();
                
            if (!$questionExists) {
                $fail('The question does not belong to this quiz.');
            }
        }
    }

    /**
     * Validate that the option belongs to the specified question.
     */
    private function validateOptionBelongsToQuestion($optionId, $fail)
    {
        $questionId = $this->input('question_id');
        
        if ($questionId) {
            $optionExists = Option::where('id', $optionId)
                ->where('question_id', $questionId)
                ->exists();
                
            if (!$optionExists) {
                $fail('The option does not belong to this question.');
            }
        }
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        $response = ApiResponseService::validationError(
            $validator->errors()->toArray(),
            'Validation failed'
        );
        
        throw new HttpResponseException(response()->json($response, 422));
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization()
    {
        $response = ApiResponseService::forbidden(
            'Unauthorized to save answer for this quiz attempt.'
        );
        
        throw new HttpResponseException(response()->json($response, 403));
    }
} 