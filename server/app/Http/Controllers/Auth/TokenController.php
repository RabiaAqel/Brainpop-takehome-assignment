<?php

namespace App\Http\Controllers\Auth;

use App\Http\Requests\LoginRequest;
use App\Http\Controllers\Controller;
use App\Services\AuthService;

class TokenController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    /**
     * Handle a login request to the application.
     *
     * Sample Request Payload:
     * {
     *     'email': 'test@example.com',
     *     'password': 'password'
     * }
     * Sample Success Response (200):
     * {
     *     'access_token': 'TOKEN',
     *     'token_type': 'Bearer'
     * }
     * Sample Failed Response (401):
     * {
     *     'message': 'Invalid login details'
     * }
     *
     * @param \App\Http\Requests\LoginRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(LoginRequest $request)
    {
        try {
            $credentials = $request->only('email', 'password');
            $result = $this->authService->authenticateUser($credentials);
            
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 401);
        }
    }
}
