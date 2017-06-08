# PSX Data

Data and tools for serializing data provided by the [PSX Data Center](https://psxdatacenter.com)

## Parser

[![Build Status](https://travis-ci.org/ticky/psxdata.svg?branch=develop)](https://travis-ci.org/ticky/psxdata)

The parser utility is included. To use it, you will need [Node](https://nodejs.org) and the [Yarn](https://yarnpkg.com) package manager installed.

Then, having cloned this repository, run `yarn && yarn sync` in the root directory.

If some data changes, feel free to send a pull request with the updated data, and/or parsing logic!

## Data Format

Data is sorted into per-platform folders, then per-region files.

_**Note**: the format of the data is in flux while this project is established. There's a good chance that once individual games' data can be parsed the index format will change._

### Indexes

Each index file contains a JSON array of objects obeying the following format:

* `id` (`string`, or `Array` of `string`s)  
  the ID (or IDs, in the case of multi-disc games) of the game release
* `title` (`string`)  
  the game's title
* `discs` (`number`)  
  the number of discs comprising the game release (inferred from number of product codes)
* `languages` (`Array` of `string`s, optional)  
  a list of language IDs, these are intended to comply with [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) and accept regional variants (such as `en-AU`) where necessary.  
  _**Note**: some languages in the data set are non-standard, however, these can be distinguished by the first and/or second letters not being lower-case._
* `link` (URL `string`, optional)  
  the fully-qualified internet URL for the PSX Data Center's entry for the title, if it exists
* `includes` (`string`, or `Array` of `string`s, optional)  
  a brief description of the extra content included with the release - extra or named discs, for instance

## License

Note that the license declared in this repository applies _only_ to the parser utility (basically, the JavaScript).

The data set itself has no known license, but crediting the [PSX Data Center](https://psxdatacenter.com) if you use it sure wouldn't go astray!
