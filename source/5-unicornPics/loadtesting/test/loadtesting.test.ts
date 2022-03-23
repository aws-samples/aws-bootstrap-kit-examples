import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Loadtesting from '../lib/loadtesting';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Loadtesting.LoadtestingStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
