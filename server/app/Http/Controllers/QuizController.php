<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use Illuminate\Http\Request;
use App\Http\Resources\QuizResource;
use App\Http\Resources\QuestionResource;
use App\Http\Requests\StartQuizAttemptRequest;
use App\Http\Requests\SaveAnswerRequest;
use App\Http\Requests\SubmitAttemptRequest;
use App\Http\Requests\QuizResultsRequest;
use App\Services\QuizService;
use App\Services\UserAnswerService;
use App\Services\ApiResponseService;
use App\Repositories\QuizRepository;

class QuizController extends Controller
{
    public function __construct(
        private QuizService $quizService,
        private UserAnswerService $userAnswerService,
        private QuizRepository $quizRepository
    ) {}

    /**
     * Display a listing of quizzes with questions and answers.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $quizzes = $this->quizRepository->getAllQuizzes();
        $response = ApiResponseService::success(
            QuizResource::collection($quizzes),
            'Quizzes retrieved successfully'
        );
        return response()->json($response);
    }

    /**
     * Display the specified quiz.
     *
     * @param  \App\Models\Quiz  $quiz
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Quiz $quiz)
    {
        $formattedQuiz = $this->quizService->formatQuizForDisplay($quiz);
        $response = ApiResponseService::success(
            $formattedQuiz,
            'Quiz retrieved successfully'
        );
        return response()->json($response);
    }

    /**
     * Display the questions for a specific quiz.
     *
     * @param  \App\Models\Quiz  $quiz
     * @return \Illuminate\Http\JsonResponse
     */
    public function showQuestions(Quiz $quiz)
    {
        $questions = $this->quizRepository->getQuizQuestions($quiz->id);
        $response = ApiResponseService::success(
            QuestionResource::collection($questions),
            'Quiz questions retrieved successfully'
        );
        return response()->json($response);
    }

    /**
     * Display the results for a specific quiz for the authenticated user.
     *
     * @param  \App\Http\Requests\QuizResultsRequest  $request
     * @param  \App\Models\Quiz  $quiz
     * @return \Illuminate\Http\JsonResponse
     */
    public function showResults(QuizResultsRequest $request, Quiz $quiz)
    {
        $user = auth()->user();
        
        $result = $this->quizService->getQuizResultsSafely($quiz, $user->id);
        
        if (isset($result['error'])) {
            $response = ApiResponseService::error(
                $result['message'],
                $result['status_code'],
                'QUIZ_RESULTS_ERROR'
            );
            return response()->json($response, $result['status_code']);
        }
        
        $response = ApiResponseService::success(
            $result,
            'Quiz results retrieved successfully'
        );
        return response()->json($response);
    }

    /**
     * Submit a quiz attempt, calculate the score, and return the results summary.
     *
     * @param  \App\Http\Requests\SubmitAttemptRequest  $request
     * @param  int  $attempt_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function submitAttempt(SubmitAttemptRequest $request, $attempt_id)
    {
        $user = auth()->user();
        
        $result = $this->quizService->submitAttempt($attempt_id, $user->id);
        $response = ApiResponseService::success(
            $result,
            'Quiz attempt submitted successfully'
        );
        return response()->json($response);
    }

    /**
     * Start or resume a quiz attempt for the authenticated user.
     *
     * @param  \App\Http\Requests\StartQuizAttemptRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function startAttempt(StartQuizAttemptRequest $request)
    {
        $user = auth()->user();
        $quizId = $request->validated()['quiz_id'];

        $attempt = $this->quizService->startQuizAttempt($user->id, $quizId);

        // Get user answers using the service
        $userAnswers = $this->userAnswerService->getUserAnswersForAttempt($attempt->id);
        $formattedAnswers = $this->userAnswerService->formatUserAnswersForResponse($userAnswers);

        $responseData = $this->quizService->formatStartAttemptResponse($attempt, $formattedAnswers);
        $response = ApiResponseService::success(
            $responseData,
            'Quiz attempt started successfully'
        );
        return response()->json($response);
    }

    /**
     * Auto-save or update a user's answer for a specific question in an attempt.
     *
     * @param  \App\Http\Requests\SaveAnswerRequest  $request
     * @param  int  $attempt_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function saveAnswer(SaveAnswerRequest $request, $attempt_id)
    {
        $user = auth()->user();
        $data = $request->validated();
        
        // Add user_id to the data for authorization
        $data['user_id'] = $user->id;
        
        $result = $this->userAnswerService->saveAnswer($data, $attempt_id);
        $response = ApiResponseService::success(
            $result,
            'Answer saved successfully'
        );
        return response()->json($response);
    }
} 