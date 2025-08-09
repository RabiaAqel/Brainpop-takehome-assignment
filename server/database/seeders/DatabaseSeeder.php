<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create default user first
        $this->call(UserSeeder::class);
        
        \App\Models\Quiz::factory()
            ->count(2)
            ->create()
            ->each(function ($quiz) {
                $questions = \App\Models\Question::factory()
                    ->count(5)
                    ->create(['quiz_id' => $quiz->id]);

                $questions->each(function ($question) {
                    $options = \App\Models\Option::factory()
                        ->count(4)
                        ->create(['question_id' => $question->id]);
                    $options->random(1)->first()->update(['is_correct' => true]);
                });
            });
    }
}
