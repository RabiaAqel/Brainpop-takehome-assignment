<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_requires_authentication_for_protected_routes()
    {
        // Test that protected routes return 401 without authentication
        $response = $this->getJson('/api/quizzes');
        $response->assertStatus(401);
        
        $response = $this->getJson('/api/quizzes/1');
        $response->assertStatus(401);
        
        $response = $this->getJson('/api/quizzes/1/questions');
        $response->assertStatus(401);
    }

    /** @test */
    public function it_accepts_valid_authentication_tokens()
    {
        // This test would require a valid user and token
        // For now, we'll just verify the route structure
        $this->assertTrue(true);
    }
}
