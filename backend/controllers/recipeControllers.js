const asyncHandler = require('express-async-handler');
const Recipe = require('../models/recipeModel');
const Review = require('../models/reviewModel');

const createRecipe = asyncHandler(async (req, res) => {
    const {
        title, description, ingredients, nutrition, tags, category,
        prepTime, cookTime, servings, calories, instructions
    } = req.body;

    const image = req.file ? `/uploads/recipes/${req.file.filename}` : null;

    if (!title || !description || !ingredients) {
        res.status(400);
        throw new Error('Title, description and ingredients are required');
    }

    const recipe = await Recipe.create({
        author: req.user.id,
        title,
        description,
        ingredients: Array.isArray(ingredients) ? ingredients : ingredients.split('\n'),
        nutrition: Array.isArray(nutrition) ? nutrition : (nutrition?.split('\n') || []),
        tags: Array.isArray(tags) ? tags : JSON.parse(tags || '[]'),
        category,
        prepTime,
        cookTime,
        servings,
        calories,
        instructions: Array.isArray(instructions) ? instructions : instructions.split('\n'),
        image
    });

    res.status(201).json(recipe);
});

const getRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id)
        .populate('author', 'username avatar')
        .populate({
            path: 'reviews',
            populate: { path: 'author', select: 'username avatar' }
        });

    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    recipe.views += 1;
    await recipe.save();

    res.status(200).json(recipe);
});

const getAllRecipes = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const search = req.query.search || '';
    const author = req.query.author;

    let query = {};

    if (search) {
        query.$text = { $search: search };
    }

    // 如果传了 author ID，就只查这个作者的
    if (author) {
        query.author = author;
    }

    const total = await Recipe.countDocuments(query);

    const recipes = await Recipe.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate('author', 'username avatar');

    res.status(200).json({
        total,
        page,
        pageSize,
        recipes
    });
});

const getLatestRecipes = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const total = await Recipe.countDocuments();
    const recipes = await Recipe.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate('author', 'username avatar');

    res.status(200).json({
        total,
        page,
        pageSize,
        recipes
    });
});

const getPopularRecipes = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;

    const recipes = await Recipe.find()
        .sort({ views: -1 })
        .limit(limit)
        .populate('author', 'username avatar');

    res.status(200).json(recipes);
});

const updateRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    if (recipe.author.toString() !== req.user.id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this recipe');
    }

    // 🔹 从 form-data 里取文本字段
    const { title, description } = req.body;
    if (title) recipe.title = title;
    if (description) recipe.description = description;

    // 🔹 处理图片文件
    if (req.file) {
        recipe.image = `/uploads/recipes/${req.file.filename}`;
    }

    await recipe.save();

    res.status(200).json({ message: 'Recipe updated successfully', recipe });
});

const deleteRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    if (recipe.author.toString() !== req.user.id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this recipe');
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Recipe removed' });
});

// 收藏/取消收藏
const toggleFavorite = asyncHandler(async (req, res) => {
    const recipeId = req.params.id;
    const userId = req.user.id; // token里 decoded 出来的

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    const isFavorited = recipe.favorites.includes(userId);

    if (isFavorited) {
        // 取消收藏
        recipe.favorites.pull(userId);
        await recipe.save();
        res.json({ message: 'Removed from favorites', isFavorited: false });
    } else {
        // 添加收藏
        recipe.favorites.push(userId);
        await recipe.save();
        res.json({ message: 'Added to favorites', isFavorited: true });
    }
});

module.exports = {
    createRecipe,
    getRecipe,
    getLatestRecipes,
    getPopularRecipes,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    getAllRecipes
};
