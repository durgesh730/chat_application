const isUrl = (string) => {
    const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
    return urlRegex.test(string);
};


module.exports = {isUrl}