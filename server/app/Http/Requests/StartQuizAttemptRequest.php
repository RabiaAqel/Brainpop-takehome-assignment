<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Services\ApiResponseService;

class StartQuizAttemptRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'quiz_id' => [
                'required',
                'integer',
                'exists:quizzes,id',
                'min:1'
            ]
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'quiz_id.required' => 'Quiz ID is required to start an attempt.',
            'quiz_id.exists' => 'The selected quiz does not exist.',
            'quiz_id.integer' => 'Quiz ID must be a valid number.',
            'quiz_id.min' => 'Quiz ID must be a positive number.',
        ];
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
} 