const bcrypt = require('bcrypt');

exports.encrpypPasswordOnSave = async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    // Delete passwordConfirm field
    this.passwordConfirm = undefined;

    // Update the passowrd change timesptamp if the document is updated with the password field
    if (this.isModified('password') || !this.isNew) this.passwordChangedAt = Date.now() - 1000;

    return next();
};

exports.findOnlyActive = function (next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    return next();
};
