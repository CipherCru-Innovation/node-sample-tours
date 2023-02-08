const slugify = require('slugify');

exports.sulgifyTour = function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
};

exports.preFindTour = function (next) {
    this.find({ secretTour: { $ne: true } }).populate('guides', {
        select: 'name email photo'
    });
    next();
};
