## Handlebar Select Options

Because handlebar is not an interpreted language, the amount of code required to make an options list in it
is fairly extensive (for the size of the problem); so I decided to publish it here.

### Prerequisites

The contents of this repo are largely superfluous - only handlebar_options.js is necessary.
Include the following files in your HTML pages

 * Underscore.js
 * Handlebars.js
 * handlebar_options.js

Call init_handlebar_options() (once) to load the helpers. 

### Use

 1. Create a list of objects with value and label properties: 

var data = [{"value":"OR",
"label":"Oregon"},
{"value":"CA",
"label":"California"},
{"value":"NY",
"label":"New York City"}]

 2. Create an Handlebar template that has a select tag in it. Note the "select_options" helper in the below form: that is a helper that init_handlebar_options() made available globally to all Handlebar templates.

    var form_template = '<h2>My Form</h2><form><select name="states">{{select_options states }}</select></form>';

 3. Render the form with the data you passed: 

    var my_form = Handlebars.compile(form_template);

 4. Render form with your data passed in. (this example uses standard jQuery methodology to do this.)

    $('#my_form').html(my_form({states: data});

## Advanced Features

You can put in any type of flat array of objects with more complex parameters for abstracting the identity
of value and label fields. See **ho_test.html** and **ho_test.js** for use of such parameters.

### Limitations

Because you have to embed the selected option's value into the option data, you can't pass in a "selected" key
to the helper -- it must be done outside the scope of a handlebar template.

This helper won't actually create a select tag -- I just don't see added value to putting things into the helper that are
easy to do in the stock Handlebars template.
   