# ScrollNumber
Input number, better

# Requirements
### Mandatory requirements
- jQuery v1.7+

# Getting started
```
$('input.scrollnumber').scrollnumber();
```

These are the default options:
```
{
	decimals: 0, // how many decimals
	step: 1, // step up/down
	min: -9999999999999, // min number
	max: 9999999999999, // max number
	dseparator: '.', // decimal separator
	tseparator: '', // thousands separator
	prefix: '', // prefix
	suffix: '', // suffix
	minAlt: '', // a text or anything to be displayed as an alternative to the min number
	maxAlt: '' // a text or anything to be displayed as an alternative to the max number
};
```

but you can overwrite them like follows:

```
$('input.scrollnumber').scrollnumber({decimals:2, step:0.05, dseparator: ',', maxAlt: 'MAX'});
```
