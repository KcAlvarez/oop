<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\BorrowLogController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProfileController;
use App\Models\Book;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // TEMPORARY: deployment diagnostic endpoint. Remove after verifying the production DB.
    Route::get('/_diag', function () {
        abort_unless(hash_equals('diag-7f3a91c2e84b', (string) request('key')), 404);

        $connection = (string) config('database.default');
        $config = (array) config("database.connections.{$connection}", []);

        try {
            $counts = [
                'categories' => Category::count(),
                'books' => Book::count(),
                'users' => User::count(),
            ];
        } catch (Throwable $e) {
            $counts = ['error' => $e->getMessage()];
        }

        return response()->json([
            'app_env' => config('app.env'),
            'app_debug' => config('app.debug'),
            'config_cached' => app()->configurationIsCached(),
            'default_connection' => $connection,
            'driver' => $config['driver'] ?? null,
            'host' => $config['host'] ?? null,
            'port' => $config['port'] ?? null,
            'database' => $config['database'] ?? null,
            'username' => $config['username'] ?? null,
            'sslmode' => $config['sslmode'] ?? null,
            'url_set' => filled($config['url'] ?? null),
            'env' => [
                'DB_CONNECTION' => env('DB_CONNECTION'),
                'DB_HOST' => env('DB_HOST'),
                'DB_PORT' => env('DB_PORT'),
                'DB_DATABASE' => env('DB_DATABASE'),
                'DB_USERNAME' => env('DB_USERNAME'),
                'DB_PASSWORD_set' => filled(env('DB_PASSWORD')),
                'DB_SSLMODE' => env('DB_SSLMODE'),
                'DB_URL_set' => filled(env('DB_URL')),
                'DATABASE_URL_set' => filled(env('DATABASE_URL')),
            ],
            'counts' => $counts,
        ]);
    });

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/books', [BookController::class, 'index']);
    Route::get('/books/featured', [BookController::class, 'featured']);
    Route::get('/books/{book}', [BookController::class, 'show']);

    Route::middleware('auth.token')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);

        Route::get('/borrow-logs', [BorrowLogController::class, 'index']);
        Route::post('/books/{book}/borrow', [BorrowLogController::class, 'borrow']);
        Route::post('/books/{book}/return', [BorrowLogController::class, 'returnBook']);

        Route::middleware('admin')->group(function () {
            Route::get('/admin/users', [AdminController::class, 'users']);
            Route::get('/admin/borrow-logs', [AdminController::class, 'borrowLogs']);
        });
    });
});
