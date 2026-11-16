<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Category;
use Illuminate\Database\Seeder;

class LibrarySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = collect([
            'Computer Science' => 'computer science.png',
            'Mathematics' => 'Mathec.png',
            'Literature' => 'literature.png',
            'History' => 'History.png',
        ])->mapWithKeys(function ($image, $name) {
            $category = Category::updateOrCreate(
                ['name' => $name],
                ['image' => $image]
            );

            return [$name => $category->id];
        });

        $books = [
            [
                'title' => 'A Textbook of Information Technology',
                'category' => 'Computer Science',
                'image' => 'information T.png',
                'total_copies' => 5,
                'available_copies' => 5,
                'is_featured' => true,
                'description' => 'A comprehensive guide covering fundamental concepts of information technology, modern computer systems, networks, and digital applications.',
            ],
            [
                'title' => 'Algorithms in C++',
                'category' => 'Computer Science',
                'image' => 'Algo.png',
                'total_copies' => 4,
                'available_copies' => 4,
                'is_featured' => true,
                'description' => 'Essential algorithms and data structures implemented in C++, designed to help students master programming logic and efficiency.',
            ],
            [
                'title' => 'Java OOP Simplified',
                'category' => 'Computer Science',
                'image' => 'java oop.png',
                'total_copies' => 6,
                'available_copies' => 6,
                'is_featured' => true,
                'description' => 'Java OOP Simplified books explain the fundamentals of Object-Oriented Programming in Java, including classes, objects, inheritance, encapsulation, and polymorphism. They help beginners understand Java programming through simple explanations and practical examples.',
            ],
            [
                'title' => 'Everything You Need to Ace Computer Science and Coding',
                'category' => 'Computer Science',
                'image' => 'computer science.png',
                'total_copies' => 8,
                'available_copies' => 8,
                'is_featured' => false,
                'description' => 'A complete guide to computer science principles, coding concepts, algorithms, and web development fundamentals.',
            ],
            [
                'title' => 'First Semester Calculus',
                'category' => 'Mathematics',
                'image' => 'calculos.png',
                'total_copies' => 3,
                'available_copies' => 3,
                'is_featured' => false,
                'description' => 'Covers limits, derivatives, integrals, and fundamental calculus theorems with clear practice problems.',
            ],
            [
                'title' => 'Cambridge Lower Secondary Mathematics',
                'category' => 'Mathematics',
                'image' => 'Mathec.png',
                'total_copies' => 7,
                'available_copies' => 7,
                'is_featured' => false,
                'description' => 'Comprehensive mathematics curriculum guide designed for lower secondary students building strong foundational skills.',
            ],
            [
                'title' => 'Academic Novels',
                'category' => 'Literature',
                'image' => 'machine.png',
                'total_copies' => 3,
                'available_copies' => 3,
                'is_featured' => false,
                'description' => 'Academic novel books combine storytelling with educational themes, exploring school life, personal growth, and intellectual challenges. They help readers develop critical thinking, improve reading skills, and gain new perspectives through engaging stories.',
            ],
            [
                'title' => 'World History Book Vol. 1',
                'category' => 'History',
                'image' => 'image 22.png',
                'total_copies' => 5,
                'available_copies' => 5,
                'is_featured' => false,
                'description' => 'An in-depth look into ancient civilizations, global milestones, and historical movements that shaped human society.',
            ],
            [
                'title' => 'World History Book Vol. 2',
                'category' => 'History',
                'image' => 'image 23.png',
                'total_copies' => 4,
                'available_copies' => 4,
                'is_featured' => false,
                'description' => 'Explores medieval history, empires, and cultural revolutions across different continents.',
            ],
            [
                'title' => 'World History Book Vol. 3',
                'category' => 'History',
                'image' => 'image 24.png',
                'total_copies' => 5,
                'available_copies' => 5,
                'is_featured' => false,
                'description' => 'Covers modern world history, major global conflicts, industrial developments, and contemporary geopolitics.',
            ],
        ];

        foreach ($books as $book) {
            Book::updateOrCreate(
                ['title' => $book['title']],
                [
                    'category_id' => $categories[$book['category']],
                    'description' => $book['description'],
                    'image' => $book['image'],
                    'total_copies' => $book['total_copies'],
                    'available_copies' => $book['available_copies'],
                    'is_featured' => $book['is_featured'],
                ]
            );
        }
    }
}
