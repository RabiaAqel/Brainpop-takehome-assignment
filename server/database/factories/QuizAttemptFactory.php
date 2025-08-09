<?php

namespace Database\Factories;

use App\Models\QuizAttempt;
use App\Models\User;
use App\Models\Quiz;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\QuizAttempt>
 */
class QuizAttemptFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = QuizAttempt::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'quiz_id' => Quiz::factory(),
            'is_submitted' => false,
            'submitted_at' => null,
        ];
    }

    /**
     * Indicate that the attempt is submitted.
     */
    public function submitted(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_submitted' => true,
            'submitted_at' => now(),
        ]);
    }
}
