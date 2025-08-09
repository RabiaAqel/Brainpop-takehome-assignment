<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add indexes for quiz_attempts table
        Schema::table('quiz_attempts', function (Blueprint $table) {
            // Index for finding user's attempts for specific quiz
            $table->index(['user_id', 'quiz_id'], 'idx_user_quiz_attempts');
            
            // Index for finding unsubmitted attempts (for cleanup)
            $table->index(['user_id', 'is_submitted'], 'idx_user_unsubmitted');
            
            // Index for finding latest submitted attempts
            $table->index(['quiz_id', 'is_submitted', 'created_at'], 'idx_quiz_submitted_latest');
        });

        // Add indexes for user_answers table
        Schema::table('user_answers', function (Blueprint $table) {
            // Index for finding answers by attempt
            $table->index(['quiz_attempt_id', 'question_id'], 'idx_attempt_question_answers');
            
            // Index for user's quiz answers
            $table->index(['user_id', 'quiz_id'], 'idx_user_quiz_answers');
        });

        // Add indexes for questions table
        Schema::table('questions', function (Blueprint $table) {
            // Index for quiz questions (already has quiz_id foreign key, but adding for clarity)
            $table->index(['quiz_id'], 'idx_quiz_questions');
        });

        // Add indexes for options table  
        Schema::table('options', function (Blueprint $table) {
            // Index for question options and correct answers
            $table->index(['question_id', 'is_correct'], 'idx_question_correct_options');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropIndex('idx_user_quiz_attempts');
            $table->dropIndex('idx_user_unsubmitted');
            $table->dropIndex('idx_quiz_submitted_latest');
        });

        Schema::table('user_answers', function (Blueprint $table) {
            $table->dropIndex('idx_attempt_question_answers');
            $table->dropIndex('idx_user_quiz_answers');
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->dropIndex('idx_quiz_questions');
        });

        Schema::table('options', function (Blueprint $table) {
            $table->dropIndex('idx_question_correct_options');
        });
    }
}; 