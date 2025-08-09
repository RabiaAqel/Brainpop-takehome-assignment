<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * Authenticate a user and create a token.
     *
     * @param array $credentials
     * @return array
     * @throws \Exception
     */
    public function authenticateUser(array $credentials): array
    {
        // Find user by email
        $user = User::where('email', $credentials['email'])->first();

        if (!$user) {
            throw new \Exception('Unauthorized', 401);
        }

        // Attempt authentication
        if (!Auth::attempt($credentials)) {
            throw new \Exception('Invalid login details', 401);
        }

        // Get authenticated user
        $user = Auth::user();
        
        // Create token
        $token = $user->createToken('auth_token')->plainTextToken;
        $expiresIn = 3600;

        return [
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => $expiresIn
        ];
    }

    /**
     * Logout a user by revoking their token.
     *
     * @param User $user
     * @return bool
     */
    public function logoutUser(User $user): bool
    {
        return $user->tokens()->delete();
    }
}
