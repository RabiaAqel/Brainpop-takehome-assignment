<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class QuizTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    private function getAuthToken(User $user): string
    {
        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);
        
        return $response->json('access_token');
    }

    /** @test */
    public function it_fetches_a_quiz()
    {
        $user = User::factory()->create([
            'password' => bcrypt('password'),
        ]);
        $token = $this->getAuthToken($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/quizzes');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id', 'title', 'question_count', 'questions'
                    ]
                ]
            ]);
    }

    /** @test */
    public function it_submits_answers_and_gets_results()
    {
        $user = User::factory()->create([
            'password' => bcrypt('password'),
        ]);
        $token = $this->getAuthToken($user);

        // Fetch quizzes and pick the first one
        $quizResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/quizzes');
        
        $quizId = $quizResponse->json('data.0.id');
        $question = $quizResponse->json('data.0.questions.0');
        
        $optionId = $question['options'][0]['id'];

        // Start attempt
        $attemptResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/quiz/attempt', ['quiz_id' => $quizId]);
        $attemptId = $attemptResponse->json('data.attempt_id');

        // Submit answer
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/attempts/$attemptId/answer", [
                'question_id' => $question['id'],
                'selected_option_id' => $optionId
            ])->assertStatus(200);

        // Submit quiz
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/attempts/$attemptId/submit")
            ->assertStatus(200);

        // Get results
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/quizzes/$quizId/results")
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'correct_answers', 'total_questions'
                ]
            ]);
    }

    /** @test */
    public function it_denies_access_to_quizzes_when_not_authenticated()
    {
        $response = $this->getJson('/api/quizzes');
        $response->assertStatus(401);
    }

    /** @test */
    public function it_fails_to_start_attempt_with_invalid_quiz_id()
    {
        $user = User::factory()->create([
            'password' => bcrypt('password'),
        ]);
        $token = $this->getAuthToken($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/quiz/attempt', ['quiz_id' => 999999]); // unlikely to exist

        $response->assertStatus(422); // Validation error, not 404
    }

    /** @test */
    public function it_fails_to_submit_answer_with_missing_fields()
    {
        $user = User::factory()->create([
            'password' => bcrypt('password'),
        ]);
        $token = $this->getAuthToken($user);

        // mock attemot
        $quizResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/quizzes');
        $quizId = $quizResponse->json('data.0.id');
        $attemptResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/quiz/attempt', ['quiz_id' => $quizId]);
        $attemptId = $attemptResponse->json('data.attempt_id');

        // submit wrong request 
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/attempts/$attemptId/answer", []);

        $response->assertStatus(422);
    }
} 