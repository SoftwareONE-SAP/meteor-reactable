# Reactable

A [Meteor](https://meteor.com) library for displaying reactive data in a HTML table. This library uses [React](https://facebook.github.io/react/) internally and exports a React component named **Reactable**. For projects which use Blaze templates, a helper template is also exported named **Reactable** so that you don't have to explicitly use React in your own project.

## Usage

###### React/JSX

```javascript
React.render(<Reactable {...config}/>, domLocation);
```

###### Blaze/Spacebars:

```
{{> Reactable config=config}}
```

As you might have guessed, all the magic happens in the "config" object.

## Minimal Example <a name="minimal-example"></a>

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
  rating:   9
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
      title: 'First Name',
    },
    {
      name: 'surname',
      title: 'Last Name',
    },
    {
      name: 'rating',
    }
  ],
};
```

Assuming a suitable subscription was in place to populate the "people" collection, the following reactive table would be produced:

First Name | Last Name | rating
-----------|-----------|-------
Mike       | Cardwell  | 10
Jean-Luc   | Picard    | 9

## Configuration

The rest of this document explains all of the other configuration values which are available to make your reactive tables much more interesting/powerful.

### config.source <a name="config-source"></a>

This object describes the source of the data for the table and is required

### config.source.collection [Object | Array] <a name="config-source-collection"></a>

This item is required. It can either be an instance of Mongo.Collection (as per the [minimal example](#example-minimal)), or it can be a raw array containing javascript objects, e.g:

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

### config.source.subscribe [String | Function | Object] <a name="config-source-subscribe"></a>

TODO
