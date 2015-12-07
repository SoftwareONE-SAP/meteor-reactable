# Reactable

A [Meteor](https://meteor.com) library for displaying reactive data in a HTML table. This library uses [React](https://facebook.github.io/react/) internally and exports a React component named **Reactable**. For projects which use Blaze templates, a helper template is also exported of the same name so that you don't have to explicitly use React in your own project.

**WARNING** - This is a very new library and is currently in heavily active development and its API will definitely change in various backwards incompatible ways. I will remove this warning when it stabilises. Use at your own risk.

## Usage

###### React/JSX

```javascript
React.render(<Reactable {...config}/>, domLocation);
```

###### Blaze/Spacebars:

```
{{> Reactable config}}
```

As you might have guessed, all the magic happens in the `config` object.

## Minimal Example

Given a collection declared as follows:

```javascript
var people = new Mongo.Collection('people');

people.insert({
  forename: 'Mike',
  surname:  'Cardwell',
  rating:   10
});

people.insert({
  forename: 'Jean-Luc',
  surname:  'Picard',
  rating:   9,
  private: {
    password: 'secret'
  }
});
```

And a minimal Reactable configuration like this:

```javascript
var config = {
  source: {
    collection: people,
  },
  fields: [
    {
      name: 'forename',
      label: 'First Name',
    },
    {
      name: 'surname',
      label: 'Last Name',
    },
    {
      name: 'rating',
    },
    {
      name: 'private.password',
    }
  ],
};
```

Assuming a suitable subscription was in place to populate the `people` collection, the following reactive table would be produced:

First Name | Last Name | Rating | Private Password
-----------|-----------|--------|-----------------
Mike       | Cardwell  | 10     |
Jean-Luc   | Picard    | 9      | secret

## Configuration

The rest of this document explains all of the other configuration values which are available to make your reactive tables much more interesting/powerful.

### `config.classes` [ `String` | `Array` | `Function` ]

This item provides the list of classes to add to the root DOM element. If it is a `String` it is added as is. If it is an `Array` of `Strings`, they are joined with spaces before being added. If it is a `Function`, it must return a `String` or an `Array` of `Strings` to be used. When it is a `Function`, it is called within the context of the ReactableUI render method so has access to the field definitions and row data through props. Example:

```javascript
var config = {
  classes: "blue strong", // or:
  classes: ["blue strong"], // or:
  classes: function () {
    var classes = ["blue", "strong"];
    if (this.props.fields.length > 1) classes.push('multi-column');
    if (this.props.rows.length   > 1) classes.push('multi-rows');  
    return classes; // or classes.join(' ')
  }
}
```

The class "reactable" is always included.

**IMPORTANT** - Never modify `this.props`. It is Reacts immutable component properties.

### `config.tableClasses` [ `String` | `Array` | `Function` ]

The same as `config.classes` except without the default "reactable" class, and it applies to the `<table/>` tag instead. Has access to the same props as runs under the same context.

### `config.trClasses` [ `String` | `Array` | `Function` ]

The same as `config.tableClasses` except it applies to the `<tr/>` tag instead. When running as a `Function` has access to `props.fields`, `props.data` and `props.count` which is the row number starting from 1.

### `config.id` [ `String` ]

Optional item for adding an `id` attribute to the root DOM element.

### `config.source` [ `Object` ]

This object describes the source of the data for the table and is required.

### `config.source.collection` [ `Object` | `Array` ]

This item is required. It can either be an instance of Mongo.Collection (as per the minimal example), or it can be a raw array containing javascript objects, e.g:

```javascript
var config = {
  source: {
    collection: [
      {
        forename: 'Mike',
        surname:  'Cardwell',
        rating:   10,
      }
    ]
  }
};
```

### config.source.subscribe [String | Function | Object]

Reactable can handle your data subscriptions, and it's usually a good idea to let it do so. In the simplest case you just provide it with the name of a publication:

```javascript
var config = {
  source: {
    subscribe: 'smart_people',
  }
};
```

It is usually a good idea because Reactable can then manage the lifecycle of the subscription, subscribing/unsubscribing as the component is mounted/unmounted. When Reactable has a handle to the subscription it can also make decisions based on whether or not the subscription is ready. For example, it can avoid re-rendering the component repeatedly as lots of data is transferred down the wire (if you choose so), or it can display a "Loading" graphic.

Rather than passing a string, you can just pass a subscription object directly:

```javascript
var config = {
  source: {
    subscribe: Meteor.subscribe('smart_people'),
  }
};
```

Because Reactable didn't create the subscription in this example (it was created externally and passed through), the Reactable component is unable to manage it's lifecycle, although it can still query its `ready` status. Maybe this is exactly what you want? Just one to be aware of.

Perhaps you want Reactable to manage the subscription, but you want to pass additional arguments, or use a different DDP connection?

```javascript
var connection = DDP.connect('https://example.com/');
var config = {
  source: {
    subscribe: {
      name: 'smart_people',
      args: ['Hello', 'World'],
      context: connection,
    }
  }
};
```

Behind the scenes, this would do a `connection.subscribe('smart_people', 'Hello', 'World')`. You can set context to `Meteor` or leave it out altogether for a normal `Meteor.subscribe`. `args` is also optional. If `args` is a `Function`, it will be called and the return value used.

If `source.subscribe` is a `Function`, it is called and the return value is used for any of the above cases. E.g:

```javascript
var config = {
  source: {
    subscribe: function () {
      // Any of these 3 are fine:
      return Meteor.subscribe('smart_people');
      return 'smart_people';
      return {
        name: 'smart_people',
        args: ['Hello', 'World'],
      };
    }
  }
}
```

### `config.source.fields` [ `Array` ]

This optional array contains a list of document keys which we wish to have access to. As with MongoDB you also get the _id. If the collection is an `Array` of `Objects` rather than a Mongo collection and an _id doesn't exist, a fake one is added. Any key which has an entry in `config.fields` (discussed next) will automatically be in this list, so usually you don't need to specify it. One example of when you might need this functionality:

```javascript
var config = {
  source: {
    fields: ['sex'],
  },
  fields: [
    {
      name: 'name',
      classes: function () {
        return rowData.sex === 'male' ? 'blue' : 'pink';
      }
    },
  ]
}
```

In this example, there is no `sex` field, so that data wont be directly in the displayed table, but we still need access to the content of the `sex` field in order to specify what class to use on the `<td/>` wrapping the `name` cells. Without `source.fields` we wouldn't have access to that data.

### `config.fields` [ `Array` ]

This item is an `Array` of `Objects`, where each `Object` specifies the contents of cells in the associated `<table/>` column. The order of the field definitions matches the order of the columns in the table: first to last, left to right. Each Object can contain the following:

#### 1. `field.label` [ `String` ]

This is an optional `String` which contains the contents of the column header. So the following definition:

```javascript
var config = {
  fields: [
    { label: "First Name" },
    { label: "Last Name"  }
  ]
}
```

Would create the following table:

```html
<table>
  <thead>
    <tr>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Secret Password</th>
    </tr>
  </thead>
</table>
```

#### 2. `field.name` [ `String` ]

This is an optional `String` that contains the name of a key in MongoDB from which we want to retrieve the value to display in the table body. If `field.label` isn't supplied, then the table column header is derived from this value instead, replacing underscores and full stops with spaces and capitalizing the first letter of each word. So the following definition would create the exact same table as above:

```javascript
var config = {
  fields: [
    { name: "first_name" },
    { name: "last_name"  },
    { name: "secret.password" }
  ]
}
```

Without a `field.name`, the column will be empty. Unless you override the contents of the column cells by using `field.td`, `field.tdInner` or `field.transform`

#### 3. `field.transform` [ `Function` ]

This is an optional function which will transform a value before putting it into the table. For example, if you wanted to display everyones first name in capital letters:

```javascript
var config = {
  fields: [
    {
      name: "first_name",
      transform: function (fname) {
        return fname.toUpperCase();
      },
    }
  ]
}
```

When transforming the value for a particular cell like this, you can also access the rest of the row data by looking in the `this.row` object. For example, you might only want to upper-case the value of `first_name` if `last_name` is Smith:

```javascript
var config = {
  fields: [
    {
      name: "first_name",
      transform: function (fname) {
        if (this.row.last_name === 'Smith') {
          fname = fname.toUpperCase();
        }
        return fname;
      },
    }
  ]
}
```

#### 4. `field.tdClasses` [ `String` | `Array` | `Function` ]

Optionally specify a list of classes to be added to each `<td/>` in this column. If supplied an `Array` then it is joined with spaces. If supplied a `Function`, then that `Function` is called with the value as the first argument and access to `props.fields`, `props.data` (row data) and `props.count` (row number). It must return either a `String` or an `Array` of Strings. For example:

```javascript
var config = {
  fields: [
    {
      name:    "first_name",
      classes: "blue strong", // or:
      classes: ["blue", "strong"], // or:
      classes: function (fname) {
        var rowData = this.props.data;
        var classes = ["blue", "strong"];
        if (fname === 'Mike') classes.push('nice');
        if (rowData.last_name === 'Cardwell') classes.push('superb');
        return classes; // or classes.join(' ');
      }
    }
  ]
};
```

#### 5. `field.thClasses` [ `String` | `Array` | `Function` ]

Works the same as `field.tdClasses`, except it is applied to the table head `<th/>`. First argument for the function is the `field.name`, and second argument is the `field.label`

#### 6. `field.td` [ `React class` ]

If you want to override what is used for a particular fields `<td/>`, you can create a React class and pass it through. Below is an example (using JSX) where we simply wrap the value that would have been placed in the cell with a `<strong/>` tag:

```javascript
var config = {
  fields: [
    {
      name: "first_name",
      td: React.createClass({
        render: function () {
          return (
            <td className={ this.props.classes }>
              <strong>{ this.props.children }</strong>
            </td>
          );
        }
      })
    }
  ]
}
```

`props.children` contains the value after it has been transformed. To get the original value or any of the other row data, you can access it from the object `props.row`. `props.classes` will only be populated if you have set something for `field.classes`. Note, the root DOM element that you return from this React class **must** be a `<td/>`

#### 7. `field.tdInner` [ `React class` ]

Works the same as `field.td` except it is wrapped in the `<td/>` tag and isn't passed a `props.classes`. To get the same effect as the `config.td` example, but with less code:

```javascript
var config = {
  fields: [
    {
      name: "first_name",
      tdInner: React.createClass({
        render: function () {
          return (
            <strong>{ this.props.children }</strong>
          );
        }
      });
    }
  ]
}
```

#### 8. `field.thInner` [ `React class` ]

This works the same as `field.tdInner` with a few differences. Props passed to the class include `name` and `label`. `props.children` contains the suggested title calculated from the label or a cleaned up version of the name. Here is an example where the column title is wrapped inside an anchor tag:

```javascript
var config = {
  fields: [
    {
      name: "first_name",
      thInner: React.createClass({
        render: function () {
          return (
            <a href={ '/wibble?name=' + this.props.name }>
              { this.props.children }
            </a>
          );
        }
      })
    }
  ]
}
```

#### 9. `field.sort` [ 'Number' | 'Object' ]

If `field.sort` exists, then the table considers that a sortable column. Sort direction is either 1 for ascending or -1 for descending to match MongoDB's sort options. When `field.sort` is specified as a number it is just a short cut for the more powerful `Object` notation. These two are the same:

```javascript
var config = {
  fields: [
    {
      sort: -1, // or:
      sort: { direction: -1 },
    }
  ]
}
```

When using Object notation, if you add a `default: true`, then table data will be sorted using this column by default:

```javascript
var config = {
  fields: [
    sort: {
      direction: 1,
      default: true,
    }
  ]
}
```

When the data source is a `Mongo.Collection`, the sorting will happen by passing sort options to the Mongo `Collection.find` function. When the data source is a non-reactive `Array`, the standard JavaScript sort function is used.

If you set `fields.sort.transform` to `true`, then the sorting will happen based on the transformed version of the value. See `field.transform`.

When a field is sortable, clicking the `<th/>` at the head of the associated table column will cause Reactable to sort on that particular column. Clicking a second time will reverse the sort direction.

#### Custom sort function

You can override the default sorting function by specifying your own in `field.sort.custom`. This function is passed to the standard JavaScript
sorting function. For example, for a case insensitive alphanumeric sort:

```javascript
var config = {
  fields: [
    sort: {
      name: 'last_name',
      custom: function (a, b) {
        return a.toLowerCase() > b.toLowerCase() ? 1
             : a.toLowerCase() < b.toLowerCase() ? -1
             : 0; // Or:
      }
    }
  ]
}
```

Inside your sorting function, you can access other columns of data from the two corresponding rows. In the above example, `a` can also be retrieved from `this.row[0].last_name` and `b` from `this.row[1].last_name`.

### `config.tr` [ `React class` ]

The default React class for a `<tr/>` is:

```javascript
React.createClass({
  render: function () {
    return (
      <tr className={ this.props.classes }>
        { this.props.children }
      </tr>
    )
  }
});
```

Where `props.children` is a list of table cells `<td/>`. If you want to override it, set `config.tr` to be your replacement React class. Other props available to this class are `props.data` which contains all of the data for the row in an object keyed on name, and also `props.fields` which contains an array of field definitions for the table.

There may be cases where you want to return multiple `<tr/>` for a single row. Because of the way React works with only a single element at the root of each component class, you need to wrap them in a `<tbody/>`:

```javascript
var config = {
  tr: React.createClass({
    render: function () {
      return (
        <tbody>
          <tr>{ this.props.children }</tr>
          <tr>
            <td colSpan={ this.props.fields.length }>
              Although I included your first name in the above row, I decided
              to include it in this row too with a bunch of text for some
              reason: { this.props.data.first_name }
            </td>
          </tr>
        </tbody>
      )
    }
  })
}
```

Yes, it is perfectly valid to have multiple `<tbody/>` in a single table. Unfortunately, we already wrap the list of rows in a `<tbody/>` one level higher, and you can't have a `<tbody/>` inside another `<tbody/>`. The fix for this is to turn off the wrapper by setting `config.addTbody` to `false`.

### `config.addTbody` [ `Boolean` ]

As described in `config.tr`, all table rows are wrapped in a `<tbody/>` by default. If you want to remove this, set `config.addTbody` to `false`. The main reason you would use this is if you're overriding the default `<tr/>` component using `config.tr` and returning a `<tbody/>` rather than a `<tr/>`.

### `config.paginate` [ `Object` | `Number` ]

You can add pagination to your table as simply as:

```javascript
var config = {
  paginate: 10,
}
```

This will make it so that a maximum of 10 results are displayed in the table. It also adds a simple form to the bottom of the table where people can skip forward/backwards and change the limit.

The above style is actually a shortcut for a more powerful style which works like this:

```javascript
var config = {
  paginate: {
    defaultLimit: 10,
  }
}
```

As well as the required `paginate.defaultLimit`, there is also an optional `paginate.defaultPage` if you don't want the table to start at page 1. To override the UI which is added to the bottom of the table, with your own component, set `paginate.ui`. For example:

```javascript
var config = {
  paginate: {
    ui: React.createClass({
      render: function () {
        return (
          <div>Your replacement form</div>
        );
      }
    })
  }
}
```

Inside your custom component you have access to many different `props`:

1. `props.totalRows`
    The total number of rows (if known)
2. `props.pages`
    The total number of pages (if known)
3. `props.limit`
    The current value for the total number of items per page
4. `props.page`
    The current page number
5. `props.hasMore`
    Whether or not there are more pages after the current one
6. `props.changeLimit`
    A function which you call with the new limit when you want to change it
7. `props.changePage`
    A function which you call with the new page when you want to change it
8. `props.nextPage`
    A function which you call when you want to skip to the next page of results
9. `props.prevPage`
    A function which you call when you want to skip to the previous page of results.

## Global Configuration

#### Reactable.setFieldDefaults [ `Function` ]

This feature is useful when you find yourself writing a lot of boiler plate code in your field definitions to set custom templates or classes. Given the following example:

```javascript
var config = {
  fields: [
    {
      name: 'first_name',
      sort: 1,
      classes: 'sortable',
      thInner: CustomSortableHeader,
    },
    {
      name: 'last_name',
      sort: 1,
      classes: 'sortable',
      thInner: CustomSortableHeader,
    },
  ]
}
```

Wouldn't it be nice if you could just say that any field with a 'sort' key automatically gets the 'sortable' class and uses the CustomSortableHeader component for `field.thInner`? You can use setFieldDefaults to do this. It takes a callback function which takes a field as input and returns the replacement field. For example:

```javascript
Reactable.setFieldDefaults(function(field){

  if (field.sort) {
    field.classes = 'sortable';
    field.thInner = SortableHeader;
  }

  return field;
});
```

**Be careful** when overwriting things like `field.classes` and `field.thInner`. Remember that they can potentially already be set and may contain different types.

The processing of `field.classes` is clever as it will take any multi-level combination of `undefined`, `null`, `Strings`, `Numbers`, `Arrays` and `Functions` and flatten them all down to a single `String`. So it is always safe to do: `field.classes = [ field.classes, 'sortable ']`` no matter what `field.classes` already contained or didn't contain.

setFieldDefaults can be called multiple times with multiple callbacks. They will each be run in the order they were added.
