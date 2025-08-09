<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use App\Models\User;

class LoginTest extends TestCase
{
    use DatabaseTransactions;

    /** @test */
    public function it_logs_in_a_user_with_valid_credentials()
    {
        // Create a test user using the factory
        $user = User::factory()->create([
            'password' => bcrypt('password'),
        ]);

        // Attempt to login with valid credentials
        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'expires_in',
            ]);
    }

    /** @test */
    public function it_fails_to_login_a_user_with_invalid_credentials()
    {
        // Create a test user using the factory
        $user = User::factory()->create([
            'password' => bcrypt('password'),
        ]);

        // Attempt to login with invalid credentials
        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Invalid login details',
            ]);
    }

    /** @test */
    public function it_fails_to_login_a_user_with_invalid_email()
    {
        // Create a test user using the factory
        User::factory()->create([
            'email' => 'validuser@example.com',
            'password' => bcrypt('password'),
        ]);

        // Attempt to login with an invalid email
        $response = $this->postJson('/api/login', [
            'email' => 'invalidemail@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthorized',
            ]);
    }

    /** @test */
    public function it_fails_to_login_a_user_with_missing_password()
    {
        // Create a test user using the factory
        $user = User::factory()->create([
            'password' => bcrypt('password'),
        ]);

        // Attempt to login without a password
        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }
}
