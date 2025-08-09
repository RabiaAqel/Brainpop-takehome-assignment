<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\Auth\TokenController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('login', [TokenController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('quizzes', [QuizController::class, 'index']);
    Route::get('quizzes/{quiz}', [QuizController::class, 'show']);
    Route::get('quizzes/{quiz}/questions', [QuizController::class, 'showQuestions']);
    Route::get('quizzes/{quiz}/results', [QuizController::class, 'showResults']);
    Route::post('quiz/attempt', [QuizController::class, 'startAttempt']);
    Route::post('attempts/{attempt_id}/answer', [QuizController::class, 'saveAnswer']);
    Route::post('attempts/{attempt_id}/submit', [QuizController::class, 'submitAttempt']);
});
