/**
 *
 * attaches a select_options helper to Handlebar, to allow for a <select> tag options to render.
 * Surprising amount of code to do this, dontcha think?
 *
 */

function init_handebar_options() {
    if (!this._run_once) {

        var options_render = Handlebars.compile('{{#each options }}' +
            '<option value="{{ value }}" ' +
            '{{#if selected }} ' +
            ' selected="selected" ' +
            '{{/if }} >' +
            '{{label }}' +
            '</option>{{/each }}');

        Handlebars.registerHelper('select_options', function (options) {
            //    console.log('select options options: ', options);
            if (!options.hasOwnProperty('options')) {
                if (_.isArray(options)) {
                    options = {options:options}
                } else {
                    throw new Error('select options must be an array of items, or an objet with options property')
                }
            }
            var ren = new Handlebars.SafeString(options_render(options));
            return ren;
        })

        this._run_once = true;
    }

}

/**
 *
 * prepares a list of items to be used in an options scenario.
 * @param list        - an array of objects.
 * @param value       - the selected value; can be false/not in the option list.
 * @param value_field - the property of each list item to be used as option value.
 * @param label_field - the property of each list item to be used as option label.
 * @param sort_by     - either a field of the collection to be used as a sort key, or a function to produce same.
 * @return Array      - an array of {value: scalar, label: scalar, selected: Boolean }
 *
 */
function handlebar_options(list, sel_value, value_field, label_field, sort_by) {

    if (arguments.length == 1 && _.isObject(list)) {
        _.each('sel_value,value_field,label_field,sort_by,list'.split(','), function (f) {
            if (list.hasOwnProperty(f)) {
                eval(f + ' = list[f]');
                console.log('f: ', f, eval(f));
            }
        })
    }

    if (!value_field) {
        value_field = 'value';
    }

    if (!label_field) {
        label_field = 'label';
    }

    //  console.log('value field: ', value_field);

    var options = _.map(list, function (item) {
        if (_.isString(value_field) && !item.hasOwnProperty(value_field)) {
            throw new Error('list item does not have value field ' + value_field);
        }

        if (_.isString(value_field) && !item.hasOwnProperty(label_field)) {
            throw new Error('list item does not have label field ' + label_field);
        }

        console.log('label field: ', label_field, 'value field', value_field);
        var v = _.isFunction(value_field) ? value_field(item) : item[value_field];
        var l = _.isFunction(label_field) ? label_field(item) : item[label_field];

        if (typeof sel_value == 'undefined'){
            var s = false;
        } else if (_.isFunction(sel_value)){
            var s = sel_value(item);
        } else if (_.isFunction(value_field)){
            var s = (sel_value == value_field(item));
        } else {
            var s = (sel_value == item[value_field]);
        }

        var out = {
            value:v,
            label:l,
            selected: s
        }
        _.defaults(out, item); // the sort_by field may be another property in the list item; allow for such properties here.
        return out;
    })

    var _sort_by = _.isFunction(sort_by) ? sort_by : function (i) {
        return i[sort_by]
    };

    return {options:_.sortBy(options, _sort_by) };
}