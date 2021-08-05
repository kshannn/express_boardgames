// import in caolan forms
const forms = require('forms');

// import in models
const { GameListing } = require('../models')

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


// ===== Vendor =====
const createVendorRegistrationForm = () => {
    return forms.create({
        'username': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.maxlength(25)],
        }),
        'address': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.maxlength(280)]
        }),
        'email': fields.email({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.email(),validators.maxlength(320)]
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.maxlength(256)]
        }),
        'confirm_password': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.matchField('password')]
        })

    })
}

// ===== Login (Vendor) =====
const createLoginForm = () => {
    return forms.create({
        'email': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        })
    })
}

// ===== Games =====
const createGameForm = (category) => {
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.maxlength(45)],
        }),
        'price': fields.string({
            label: "Price (in cents)",
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[validators.integer(), validators.min(0)]
        }),
        'min_player_count': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[validators.integer(), validators.min(1)]
        }),
        'max_player_count': fields.string({
            label:'Max player count (i.e. if no max, type "0" in the field)',
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[validators.integer()]
        }),
        'min_age': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[validators.integer(),validators.min('0')]
        }),
        'duration': fields.string({
            label: 'Duration(mins)',
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[validators.integer(),validators.min('0')]
        }),
        'designer': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.maxlength(200)],
        }),
        'publisher': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.maxlength(150)],
        }),
        'stock': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators:[validators.integer(), validators.min(1)]
        }),
        'published_date': fields.date({
            required: true,
            errorAfterField: true,
            widget: forms.widgets.date(),
            cssClasses: {
                label: ['form-label']
            }
        }),
        'categories':fields.string({
            required: true,
            errorAfterField: true,
            cssClasses:{
                label: ['form-label']
            },
            widget: widgets.multipleSelect(),
            choices: category
        }),
        'description': fields.string({
            required: true,
            errorAfterField: true,
            widget: forms.widgets.textarea(),
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.maxlength(350)],
        }),
        'image': fields.string({
            required: true,
            errorAfterField: true,
            widget: forms.widgets.hidden(),
            cssClasses: {
                label: ["form-label"]
            }
        })
    })
}

// ===== Orders =====
const updateOrderForm = (status) => {
    return forms.create({
        'statuses':fields.string({
            label: 'Status',
            required: true,
            errorAfterField: true,
            cssClasses:{
                label: ['form-label']
            },
            widget: widgets.select(),
            choices: status
        })   
    })
}

// ===== Search Engine =====
const createSearchForm = (category) => {
    return forms.create({
        'name': fields.string({
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'categories':fields.string({
            required: false,
            errorAfterField: true,
            cssClasses:{
                label: ['form-label']
            },
            widget: widgets.multipleSelect(),
            choices: category
        }),
        // 'min_price': fields.string({
        //     required: false,
        //     errorAfterField: true,
        //     cssClasses: {
        //         label: ['form-label']
        //     },
        //     validators:[validators.integer(), validators.min(0)]
        // }),
        // 'max_price': fields.string({
        //     required: false,
        //     errorAfterField: true,
        //     cssClasses: {
        //         label: ['form-label']
        //     },
        //     validators:[validators.integer(), validators.min(0)]
        // }),
        // ,
        // 'min_player_count': fields.string({
        //     required: false,
        //     errorAfterField: true,
        //     cssClasses: {
        //         label: ['form-label']
        //     }
        // }),
        // 'max_player_count': fields.string({
        //     required: false,
        //     errorAfterField: true,
        //     cssClasses: {
        //         label: ['form-label']
        //     }
        // }),
        // 'min_age': fields.string({
        //     required: false,
        //     errorAfterField: true,
        //     cssClasses: {
        //         label: ['form-label']
        //     }
        // }),
        // 'designer': fields.string({
        //     required: false,
        //     errorAfterField: true,
        //     cssClasses: {
        //         label: ['form-label']
        //     }
        // }),
        // 'publisher': fields.string({
        //     required: false,
        //     errorAfterField: true,
        //     cssClasses: {
        //         label: ['form-label']
        //     }
        // }),
        // 'stock': fields.string({
        //     required: false,
        //     errorAfterField: true,
        //     cssClasses: {
        //         label: ['form-label']
        //     }
        // })
        // ,
        // 'published_date': fields.date({
        //     required: false,
        //     errorAfterField: true,
        //     widget: forms.widgets.date(),
        //     cssClasses: {
        //         label: ['form-label']
        //     }
        // })
    })
}


// search form for orders
const createOrdersSearchForm = (statuses) => {
    return forms.create({
        'order_id': fields.string({
            label: "Order ID",
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'recipient_id': fields.string({
            label: "Recipient ID",
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'status':fields.string({
            required: false,
            errorAfterField: true,
            cssClasses:{
                label: ['form-label']
            },
            widget: widgets.select(),
            choices: statuses
        }),
    })
}



module.exports = {
    bootstrapField,
    createGameForm,
    createVendorRegistrationForm,
    createLoginForm,
    updateOrderForm,
    createSearchForm,
    createOrdersSearchForm
}