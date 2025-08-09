<?php

namespace App\Services;

class ApiResponseService
{
    /**
     * Create a successful response.
     *
     * @param mixed $data
     * @param string $message
     * @param int $statusCode
     * @return array
     */
    public static function success($data = null, string $message = 'Success', int $statusCode = 200): array
    {
        return [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'status_code' => $statusCode,
        ];
    }

    /**
     * Create an error response.
     *
     * @param string $message
     * @param int $statusCode
     * @param string $errorCode
     * @param array $errors
     * @return array
     */
    public static function error(string $message, int $statusCode = 400, string $errorCode = 'ERROR', array $errors = []): array
    {
        $response = [
            'success' => false,
            'message' => $message,
            'error_code' => $errorCode,
            'status_code' => $statusCode,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return $response;
    }

    /**
     * Create a paginated response.
     *
     * @param mixed $data
     * @param array $pagination
     * @param string $message
     * @return array
     */
    public static function paginated($data, array $pagination, string $message = 'Data retrieved successfully'): array
    {
        return [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'pagination' => $pagination,
            'status_code' => 200,
        ];
    }

    /**
     * Create a validation error response.
     *
     * @param array $errors
     * @param string $message
     * @return array
     */
    public static function validationError(array $errors, string $message = 'Validation failed'): array
    {
        return self::error($message, 422, 'VALIDATION_ERROR', $errors);
    }

    /**
     * Create an unauthorized response.
     *
     * @param string $message
     * @return array
     */
    public static function unauthorized(string $message = 'Unauthorized'): array
    {
        return self::error($message, 401, 'UNAUTHORIZED');
    }

    /**
     * Create a forbidden response.
     *
     * @param string $message
     * @return array
     */
    public static function forbidden(string $message = 'Forbidden'): array
    {
        return self::error($message, 403, 'FORBIDDEN');
    }

    /**
     * Create a not found response.
     *
     * @param string $message
     * @return array
     */
    public static function notFound(string $message = 'Resource not found'): array
    {
        return self::error($message, 404, 'NOT_FOUND');
    }

    /**
     * Create a server error response.
     *
     * @param string $message
     * @return array
     */
    public static function serverError(string $message = 'Internal server error'): array
    {
        return self::error($message, 500, 'SERVER_ERROR');
    }
}
