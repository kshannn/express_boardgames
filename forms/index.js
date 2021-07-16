// import in caolan forms
const forms = require('forms');

// create shortcuts
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

var bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) {
        object.widget.classes = [];
    }
    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }
    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }
    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' :
        '';
    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};


// games
const createGameForm = () => {
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'price': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'description': fields.string({
            required: true,
            errorAfterField: true,
            widget: forms.widgets.textarea(),
            cssClasses: {
                label: ['form-label']
            }
        }),
        'min_player_count': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'max_player_count': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'min_age': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'duration': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'designer': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'publisher': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'stock': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'posted_date': fields.date({
            required: true,
            errorAfterField: true,
            widget: forms.widgets.date(),
            cssClasses: {
                label: ['form-label']
            }
        }),
        'published_date': fields.date({
            required: true,
            errorAfterField: true,
            widget: forms.widgets.date(),
            cssClasses: {
                label: ['form-label']
            }
        })
    })
}

module.exports = {
    bootstrapField,
    createGameForm
}