function ho_test() {

    var expected_html = [0,
        '<select name="states"><option value="OR">Oregon</option><option value="CA">California</option><option value="NY">New York City</option></select>',
        '<select name="states"><option value="CA">California</option><option value="NY">New York City</option><option value="OR">Oregon</option></select>',
        '<select name="states"><option value="CA">California</option><option value="NY" selected="selected">New York City</option><option value="OR">Oregon</option></select>',
        '<select name="states"><option value="OR">Oregon</option><option value="CA">California</option><option value="NY" selected="selected">New York City</option></select>',
        'list item does not have value field bad_field',
        '<h1>Social Networks</h1><form><select name="social_networks"><option value="1">Facebook</option><option value="2" selected="selected">Twitter</option><option value="3">MySpace</option><option value="4">linkedIn</option></select></form>'
        , '<h1>Social Networks</h1><form><select name="social_networks"><option value="1">Facebook</option><option value="2">Twitter</option><option value="3" selected="selected">MySpace</option><option value="4">linkedIn</option></select></form>'
    ];

    init_handebar_options();

    /**
     * TEST 1: Stock pre-formatted value/label pairs
     * @type {String}
     */

    var s1_template = '<select name="states">{{select_options states }}</select>';
    var s1_render = Handlebars.compile(s1_template);
    var data = [
        {value:'OR', label:'Oregon'},
        {value:'CA', label:'California'},
        {value:'NY', label:'New York City'}
    ];
    $('#m1in').text(JSON.stringify(data).replace(/,/g, ",\n"));

    var states = handlebar_options(data);
    $('#m1').html(s1_render({states:states}));

    /**
     *  TEST 2: Sorted data
     * @type {Object}
     */
    var datas = {list:data, sort_by:'label'};
    states = handlebar_options(datas)
    $('#m2in').text(JSON.stringify(datas).replace(/,/g, ",\n"));
    $('#m2').html(s1_render({states:states}));

    /**
     *  TEST 3: selected value
     * @type {Object}
     */
    datas = {list:data, sort_by:'label', sel_value:'NY'};
    states = handlebar_options(datas)
    $('#m3in').text(JSON.stringify(datas).replace(/,/g, ",\n"));
    $('#m3').html(s1_render({states:states}));

    /**
     *  TEST 4:  custom fields for value/label, selected value, sorted
     * @type {Array}
     */
    var data = [
        {id:'OR', name:'Oregon'},
        {id:'CA', name:'California'},
        {id:'NY', name:'New York City'}
    ];

    datas = {list:data, value_field:'id', label_field:'name', sel_value:'NY'};
    states = handlebar_options(datas);

    $('#m4in').text(JSON.stringify(datas).replace(/,/g, ",\n"));
    $('#m4').html(s1_render({states:states}));

    /**
     * TEST 5: bad field designation
     */
    try {

        datas = {list:data, value_field:'bad_field', label_field:'name', sel_value:'NY'};
        $('#m5in').text(JSON.stringify(datas).replace(/,/g, ",\n"));

        states = handlebar_options(datas);

        $('#m5').html(s1_render({states:states}));
    } catch (err) {
        $('#m5').html(err.message);
    }

    /**
     * TEST 6: functional field/value retrieval
     *
     * This attempts to "Mock up" an advanced data store a la backbone.
     */

    function Store(id, name) {
        this._id = id;
        this._name = name;
    }

    Store.prototype.get = function (f) {
        var v = this['_' + f];

        console.log('field:', f, 'value:', v);
        return v
    }

    data = [new Store(1, "Facebook"), new Store(2, "Twitter"), new Store(3, "MySpace"), new Store(4, "linkedIn")];
    datas = {list:data, value_field:function (item) {
        return item.get('id')
    }, label_field:function (item) {
        return item.get('name')
    }, sel_value:2};
    $('#m6in').text(JSON.stringify(datas).replace(/,/g, ",\n"));
    var social_networks = handlebar_options(datas);

    var sn_template = '<h1>Social Networks</h1><form><select name="social_networks">{{select_options social_networks }}</select></form>'
    var sn_render = Handlebars.compile(sn_template);
    $('#m6').html(sn_render({social_networks:social_networks}));


    /**
     * TEST 7: functional field/value retrieval
     *
     * This attempts to "Mock up" an advanced data store a la backbone.
     * Note - getting lazy - reusing data and template from test 6.
     */
    $('#m7in').text(JSON.stringify(datas).replace(/,/g, ",\n"));

    datas.sel_value = function (item) {
        return item.get('id') == 3;
    }
     social_networks = handlebar_options(datas);
    $('#m7').html(sn_render({social_networks:social_networks}));

    /**
     * PRETTIFYING THE CELLS
     * This is not part of the test - per se - just an attempt to pretty up the display and show
     * what values are expected.
     */
    // pre

    for (var i = 1; i < expected_html.length; ++i) {
        var markup = $('#m' + i).html();
        $('#m' + i + 'pre').text(markup.replace(/>/g, ">\n"));
        if (markup == expected_html[i]) {
            $('#m' + i + 'result').html('<span style="color: green">PASS</span>');
        } else {
            $('#m' + i + 'result').html('<span style="color: red">EPIC FAIL</span><br />'
                + '<p>expected: <pre>' + expected_html[i].replace(/</g, '&lt;').replace(/>/g, '&gt;' + "\r\n") + '</pre></p>'
            );
        }
    }

    /**
     * the following makes all cells in a rowset equally high.
     */
    $('div.row').each(function (i, row) {
        var height = 0;

        $('div.span4', row).each(function (i, cell) {
            try {
                var h = $(cell).height();
                height = Math.max(height, h);
            } catch (err) {
                console.log('error getting height', err);
            }
        })


        $('div.span4 div.inner', row).each(function (i, cell) {
            $(cell).attr('style', 'min-height: ' + (height - 20) + 'px; display: block;');
        })
        $('div.span4', row).each(function (i, cell) {
            $(cell).attr('style', 'min-height: ' + (height + 20) + 'px; display: block;');
        })

    })
}