/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import "RNSplashScreen.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"emurgo"
                                            initialProperties:nil];



  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  [RNSplashScreen show];

  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Implemented from: http://pinkstone.co.uk/how-to-control-the-preview-screenshot-in-the-ios-multitasking-switcher/
// Use applicationDidEnterBackground, instead of applicationWillResignActive, so
// we don't show switch screen when modal prompts, e.g. biometrics prompt, are in foreground
- (void)applicationDidEnterBackground:(UIApplication *)application
{
  // get splash screen view
  NSArray *objects = [[NSBundle mainBundle] loadNibNamed:@"LaunchScreen" owner:self options:nil];
  UIView *switcherView = [objects objectAtIndex:0];

  switcherView.alpha = 1.0;
  switcherView.tag = 1234;
  switcherView.frame = self.window.frame;

  [self.window addSubview:switcherView];
  [self.window bringSubviewToFront:switcherView];

  [self.window snapshotViewAfterScreenUpdates:YES];
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
  UIView *switcherView = [self.window viewWithTag:1234];

  // fade away colour view from main view
  [UIView animateWithDuration:0.5 animations:^{
      switcherView.alpha = 0;
  } completion:^(BOOL finished) {
      // remove when finished fading
      [switcherView removeFromSuperview];
  }];
}

@end
