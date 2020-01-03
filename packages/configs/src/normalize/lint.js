// @flow

export type rulesType = {
  'jsdoc/check-tag-names'?: [string, { definedTags: $ReadOnlyArray<string> }],
  'jsdoc/require-example'?: [string, { exemptedBy: $ReadOnlyArray<string> }],
  'jsdoc/require-param'?: [string, { exemptedBy: $ReadOnlyArray<string> }],
  'jsdoc/require-returns'?: [string, { exemptedBy: $ReadOnlyArray<string> }],
};

export type lintType = {
  rules?: $ObjMap<rulesType, <V>(V) => V | string>,
};

export default {
  rules: <C: {}>(
    rules: $PropertyType<lintType, 'rules'>,
    newRulesCallback: C,
  ) =>
    Object.keys(newRulesCallback).reduce(
      (result: $PropertyType<lintType, 'rules'>, ruleName: $Keys<C>) => ({
        ...result,
        [ruleName]: newRulesCallback[ruleName](
          rules?.[ruleName] instanceof Array
            ? rules?.[ruleName]
            : [rules?.[ruleName], {}],
        ),
      }),
      rules,
    ),
};
