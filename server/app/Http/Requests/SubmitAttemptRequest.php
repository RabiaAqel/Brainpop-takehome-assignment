<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Models\QuizAttempt;
use App\Services\ApiResponseService;

class SubmitAttemptRequest extends FormRequest
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
            // No additional fields needed for submission, but we validate the attempt
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            // Custom messages if needed
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

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization()
    {
        $response = ApiResponseService::forbidden(
            'Unauthorized to submit this quiz attempt.'
        );
        
        throw new HttpResponseException(response()->json($response, 403));
    }
}
