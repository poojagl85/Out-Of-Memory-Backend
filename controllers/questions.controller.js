const Question = require("../models/questions.model");
const Category = require("../models/category.model");
const User = require("../models/user.model");
const slugify = require("slugify");

exports.postQuestion = async (req, res) => {
	try {
		const { title, description, categoryId } = req.body;
		const slug = slugify(title);

		const question = new Question({
			title,
			slug,
			description,
			categoryId,
			authorID: req.user._id,
		});

		console.log(categoryId);

		const _question = await question.save();
		const userId = _question.authorID;

		const _cat = await Category.updateOne(
			{ _id: categoryId },
			{
				$push: {
					questionId: _question._id,
				},
			}
		);

		console.log(_cat);

		const _user = await User.updateOne(
			{ _id: userId },
			{
				$push: {
					activityId: _question._id,
				},
			}
		);

		return res.status(200).json({
			message: `Question posted...!`,
			question: {
				_question,
			},
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: "Internal Server Error",
		});
	}
};

exports.getQuestions = async (req, res) => {
	try {
		const pageNumber = req.query.page;

		const skip = (pageNumber - 1) * 10;

		const questions = await Question.find({})
			.skip(skip)
			.limit(10)
			.populate("authorID");
		console.log(questions);
		return res.status(200).json({
			questions,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: "Internal Server Error",
		});
	}
};

exports.getQuestionDetail = async (req, res) => {
	try {
		const slug = req.query.slug;
		const question = await Question.findOne({ slug: slug })
			.populate("authorID", "fullName email username")
			.populate({
				path: "solutionId",
				populate: {
					path: "authorID",
					select: "fullName email username",
				},
			})
			.populate("categoryId", );

		return res.status(200).json({
			question,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: "Internal Server Error",
		});
	}
};
