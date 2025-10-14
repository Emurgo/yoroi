import * as React from 'react'
import Svg, {Defs, LinearGradient, Path, Stop, SvgProps} from 'react-native-svg'

const QRs = (props: SvgProps) => (
  <Svg fill="none" viewBox="0 0 280 280" height={280} width={280} {...props}>
    <Path
      fill="url(#a)"
      d="m112 36 2-3 3 1 6 3 95 55c3 1 5 5 5 8v117l-1 2-1 1h-3l-101-58c-2-2-5-6-5-9V36Z"
    />
    <Path
      fill="url(#b)"
      fillRule="evenodd"
      d="M128 25h-4l-1 3v116c0 3 3 7 5 9l95 54 6 4h4l1-3V92l-11 8c0-3-2-7-5-8l11-9-101-58Z"
      clipRule="evenodd"
    />
    <Path fill="url(#c)" d="M234 92c0-4-2-8-5-9l-11 9c3 1 5 5 5 8l11-8Z" />
    <Path fill="url(#d)" d="M123 37v-9l1-3-10 8 3 1 6 3Z" />
    <Path fill="url(#e)" d="m229 211-6-4v10l-1 2 11-8h-4Z" />
    <Path
      fill="url(#f)"
      d="M112 37c0-3 2-4 5-3l100 58c3 2 5 6 5 9v116c0 3-2 4-5 2l-100-57c-3-2-5-6-5-9V37Z"
    />
    <Path
      fill="#0EE7EA"
      fillRule="evenodd"
      d="m161 70 8 4v4l-8-4v-4Zm12 6 3 2v9l-3-2v-9Zm-19-6 7 4v4l-7-4v-4Zm11 11 4 2v4l4 2v4l-8-4v-8Zm11 6 8 4v22l-4-2V98l-4-2v-9Zm-26-11 4 2v5l4 2v4l-8-4v-9Zm11 15 8 5v8l-4-2v-4l-4-2v-5Zm12 7 3 2v13l4 2v9l7 4v8l-7-4v4l7 5v4l-3-2v4l-8-4v9l-7-5v5l-4-3v9l8 4v-8l3 2v8l4 3v4l11 6v5l-7-5v5l3 2v4l-3-2v4l-4-2v-9l-4-2v5l-3-3v-4l-4-2v-4l-8-5v5l-7-5v-12l7 4v-13l4 2v-4l-11-7v9l4 2v4l-4-2v5l-4-3v-17l-3-2v-4l-4-2v-5l7 5v-5l4 2v9l15 9v4l4 2v-4l-4-2v-5l-8-4v-4l4 2v-4l4 2v4l4 2v4l3 3v-5l-3-2v-4l3 2v-4l-3-2v-5l3 2v-4l-7-4v4l-4-2v-4l-4-3v-4l-3-2v-9l3 3v4l4 2v4l8 5V98Zm-23-9 4 2v5l-4-3v-4Zm-30-8 8 4v4l11 7v-5l11 7v4l-7-4v4l7 4v5l-11-7v-4l-4-2v4l4 2v4l-4-2v5l-3-3v5l-4-2v-9l-8-4V81Zm34 19 4 2v9l-4-3v-8Zm41 24 7 4v4l8 4v5l4 2v13l-4-2v-9l-4-2v-4l-4-3v9l-7-4v-5l4 3v-5l-4-2v4l-4-2v-8l4 2v-4Zm-37-13 3 2v4l-3-2v-4Zm-8 0 8 4v9l-4-3v-4l-4-2v-4Zm11 6 4 2v5l-4-3v-4Zm-18-6 4 2v4l-4-2v-4Zm44 25 4 3v4l-4-2v-5Zm-67-34 4 2v17l-4-2v-17Zm71 41 4 2v4l7 5v4l4 2v9l-4-2v-5l-3-2v-4l-4-2v4l-4-2v-4l-4-3v-4l4 2v-4Zm15 9 4 2v4l4 2v9l-4-2v-5l-4-2v-8Zm-74-39 7 4v9l8 4v4l-15-8v-5l-4-2v-4l4 2v-4Zm78 62 4 2v5l-4-2v-5Zm-4 2 4 3v4l-4-2v-5Zm-4 3 4 2v4l-4-2v-4Zm4 6 8 4v17l-4-2v-13l-4-2v-4Zm-7 0 7 4v5l-7-5v-4Zm-49-24 4 2v5l4 2v4l-8-4v-9Zm41 24 8 4v5l-8-5v-4Zm-26-11 4 2v5l-4-3v-4Zm34 20 3 2v4l-3-2v-4Z"
      clipRule="evenodd"
    />
    <Path
      fill="#0EE7EA"
      fillRule="evenodd"
      d="m120 46 27 15v30l-27-15V46Zm4 7 19 10v22l-19-11V53Zm4 6 11 6v13l-11-6V59Zm59 26 27 15v30l-27-15V85Zm4 6 19 11v22l-19-11V91Zm4 7 11 6v13l-11-6V98Zm-75 26 27 15v30l-27-15v-30Zm4 6 19 11v21l-19-10v-22Zm4 6 11 7v13l-11-7v-13Zm52 13 19 11v22l-19-11v-22Zm4 7 11 6v13l-11-6v-13Zm3 6 4 2v5l-4-2v-5Z"
      clipRule="evenodd"
    />
    <Path
      fill="url(#g)"
      d="m80 53 1-4 4 1 6 3 94 55c3 2 5 6 5 9v119h-5L85 178c-3-2-5-6-5-9V53Z"
    />
    <Path
      fill="url(#h)"
      fillRule="evenodd"
      d="M96 41h-4l-1 3v116c0 3 2 7 5 9l94 55 6 3h4l1-3V108l-11 9c0-3-2-7-5-9l11-9L96 41Z"
      clipRule="evenodd"
    />
    <Path fill="url(#i)" d="M201 108c0-3-2-7-5-9l-11 9c3 2 5 6 5 9l11-9Z" />
    <Path fill="url(#j)" d="M91 53v-9l1-3-11 8 4 1 6 3Z" />
    <Path fill="url(#k)" d="m196 227-6-3v12l10-9h-4Z" />
    <Path
      fill="url(#l)"
      d="M80 53c0-3 2-4 5-2l100 57c3 2 5 6 5 9v116c0 3-2 4-5 3L85 178c-3-2-5-6-5-9V53Z"
    />
    <Path
      fill="#0EE7EA"
      fillRule="evenodd"
      d="m129 86 7 4v5l-7-5v-4Zm11 7 4 2v8l-4-2v-8Zm-19-7 8 4v5l-8-5v-4Zm12 11 3 2v4l4 2v5l-7-5v-8Zm11 6 7 5v21l-4-2v-13l-3-2v-9Zm-26-10 3 2v4l4 2v4l-7-4v-8Zm11 15 7 4v8l-3-2v-4l-4-2v-4Zm11 6 4 2v13l3 2v9l8 4v9l-8-5v5l8 4v4l-4-2v5l-7-5v9l-8-4v4l-3-2v8l7 5v-9l4 2v9l3 2v4l12 7v4l-8-4v4l4 2v4l-4-2v5l-4-3v-8l-3-2v4l-4-2v-4l-4-3v-4l-7-4v4l-8-4v-13l8 4v-13l4 2v-4l-12-6v8l4 2v5l-4-2v4l-3-2v-18l-4-2v-4l-4-2v-4l8 4v-4l3 2v8l15 9v4l4 2v-4l-4-2v-4l-7-5v-4l4 2v-4l3 2v4l4 2v5l4 2v-4l-4-3v-4l4 2v-4l-4-2v-4l4 2v-5l-8-4v4l-3-2v-4l-4-2v-5l-4-2v-8l4 2v4l4 2v5l7 4v-13Zm-22-9 3 3v4l-3-2v-5Zm-30-8 7 4v4l12 7v-4l11 6v4l-8-4v4l8 5v4l-11-7v-4l-4-2v4l4 2v5l-4-2v4l-4-2v4l-4-2v-9l-7-4V97Zm33 19 4 2v9l-4-2v-9Zm41 24 8 4v4l7 5v4l4 2v13l-4-2v-9l-3-2v-4l-4-2v8l-8-4v-4l4 2v-4l-4-3v5l-3-2v-9l3 2v-4Zm-37-13 4 2v4l-4-2v-4Zm-7 0 7 4v9l-4-2v-5l-3-2v-4Zm11 6 4 3v4l-4-2v-5Zm-19-6 4 2v4l-4-2v-4Zm45 26 4 2v4l-4-2v-4Zm-67-35 4 2v18l-4-2v-18Zm71 41 3 2v5l8 4v4l4 2v9l-4-2v-4l-4-3v-4l-4-2v4l-3-2v-4l-4-2v-5l4 3v-5Zm15 9 3 2v4l4 2v9l-4-2v-4l-3-3v-8Zm-75-39 8 4v9l7 4v5l-15-9v-4l-4-2v-5l4 2v-4Zm78 63 4 2v4l-4-2v-4Zm-3 2 3 2v4l-3-2v-4Zm-4 2 4 2v4l-4-2v-4Zm4 6 7 5v17l-4-2v-13l-3-2v-5Zm-8 0 8 5v4l-8-4v-5Zm-48-23 3 2v4l4 2v5l-7-5v-8Zm41 23 7 5v4l-7-4v-5Zm-26-10 3 2v4l-3-2v-4Zm33 19 4 2v4l-4-2v-4Z"
      clipRule="evenodd"
    />
    <Path
      fill="#0EE7EA"
      fillRule="evenodd"
      d="m88 62 26 15v31L88 93V62Zm4 7 18 11v21L92 90V69Zm3 6 12 7v13l-12-7V75Zm60 26 26 15v30l-26-15v-30Zm4 7 18 10v22l-18-11v-21Zm3 6 12 6v13l-12-6v-13Zm-74 26 26 15v30l-26-15v-30Zm4 6 18 11v22l-18-11v-22Zm3 7 12 6v13l-12-6v-13Zm52 13 19 10v22l-19-11v-21Zm4 6 11 7v13l-11-7v-13Zm4 7 4 2v4l-4-2v-4Z"
      clipRule="evenodd"
    />
    <Path
      fill="url(#m)"
      d="M46 70c0-2 1-3 2-3h3l6 4 95 54c3 2 5 6 5 9v116l-1 3-1 1-3-1-101-58c-3-1-5-5-5-9V70Z"
    />
    <Path
      fill="url(#n)"
      fillRule="evenodd"
      d="M62 58h-4l-1 3v116c0 4 2 8 5 9l95 55 6 3 3 1 1-1 1-3V125l-11 9c0-3-2-7-5-9l11-9L62 58Z"
      clipRule="evenodd"
    />
    <Path fill="url(#o)" d="M168 125c0-3-2-7-5-9l-11 9c3 2 5 6 5 9l11-9Z" />
    <Path fill="url(#p)" d="M57 71V61l1-3-10 9h3l6 4Z" />
    <Path fill="url(#q)" d="m163 244-6-3v9l-1 3 10-8-3-1Z" />
    <Path
      fill="url(#r)"
      d="M46 71c0-3 2-5 5-3l100 58c3 1 5 5 5 8v116c0 3-2 5-5 3L51 195c-3-1-5-5-5-9V71Z"
    />
    <Path
      fill="#0EE7EA"
      fillRule="evenodd"
      d="m95 103 8 5v4l-8-4v-5Zm11 7 4 2v9l-4-3v-8Zm-18-7 7 5v4l-7-4v-5Zm11 11 4 2v5l3 2v4l-7-4v-9Zm11 7 8 4v21l-4-2v-13l-4-2v-8Zm-26-11 4 2v4l4 2v5l-8-5v-8Zm11 15 8 4v9l-4-2v-5l-4-2v-4Zm11 6 4 3v12l4 3v8l7 4v9l-7-4v4l7 4v5l-3-2v4l-8-4v8l-7-4v4l-4-2v9l7 4v-9l4 2v9l4 2v5l11 6v4l-7-4v4l3 2v5l-3-2v4l-4-2v-9l-4-2v4l-4-2v-4l-3-2v-5l-8-4v4l-7-4v-13l7 4v-12l4 2v-5l-11-6v9l4 2v4l-4-2v4l-4-2v-17l-4-2v-5l-3-2v-4l7 4v-4l4 2v9l15 8v5l3 2v-5l-3-2v-4l-8-4v-5l4 2v-4l4 2v5l3 2v4l4 2v-4l-4-2v-5l4 3v-5l-4-2v-4l4 2v-4l-7-5v5l-4-2v-5l-4-2v-4l-3-2v-9l3 2v5l4 2v4l7 4v-13Zm-22-8 4 2v4l-4-2v-4Zm-30-9 8 4v5l11 6v-4l11 6v5l-7-5v5l7 4v4l-11-6v-4l-4-3v5l4 2v4l-4-2v4l-4-2v4l-3-2v-8l-8-5v-17Zm34 20 4 2v8l-4-2v-8Zm41 23 7 4v5l8 4v4l3 3v12l-3-2v-8l-4-2v-5l-4-2v9l-7-5v-4l3 2v-4l-3-2v4l-4-2v-9l4 2v-4Zm-37-13 3 2v5l-3-2v-5Zm-8 0 8 5v8l-4-2v-4l-4-2v-5Zm11 7 4 2v4l-4-2v-4Zm-18-7 3 2v5l-3-2v-5Zm44 26 4 2v5l-4-3v-4Zm-67-34 4 2v17l-4-2v-17Zm71 41 4 2v4l7 4v5l4 2v8l-4-2v-4l-4-2v-5l-3-2v5l-4-3v-4l-4-2v-4l4 2v-4Zm15 8 4 2v5l3 2v8l-3-2v-4l-4-2v-9Zm-75-39 8 5v8l7 5v4l-15-9v-4l-3-2v-4l3 2v-5Zm79 63 3 2v4l-3-2v-4Zm-4 2 4 2v4l-4-2v-4Zm-4 2 4 2v5l-4-3v-4Zm4 7 7 4v17l-3-2v-13l-4-2v-4Zm-8 0 8 4v4l-8-4v-4Zm-48-24 4 2v4l4 3v4l-8-4v-9Zm41 24 7 4v4l-7-4v-4Zm-26-11 4 2v4l-4-2v-4Zm33 19 4 2v5l-4-2v-5Z"
      clipRule="evenodd"
    />
    <Path
      fill="#0EE7EA"
      fillRule="evenodd"
      d="m54 80 26 15v30l-26-15V80Zm4 6 19 11v21l-19-10V86Zm4 7 11 6v13l-11-6V93Zm59 25 26 16v30l-26-15v-31Zm4 7 19 11v21l-19-11v-21Zm4 6 11 7v13l-11-7v-13Zm-75 26 26 15v30l-26-15v-30Zm4 7 19 10v22l-19-11v-21Zm4 6 11 7v12l-11-6v-13Zm52 13 18 11v21l-18-10v-22Zm4 6 11 7v13l-11-7v-13Zm3 7 4 2v4l-4-2v-4Z"
      clipRule="evenodd"
    />
    <Defs>
      <LinearGradient
        id="a"
        x1={241.9}
        x2={241.9}
        y1={244.6}
        y2={23}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#1D45BA" />
        <Stop offset={0.4} stopColor="#1D47BA" />
        <Stop offset={0.6} stopColor="#1D4EB9" />
        <Stop offset={0.7} stopColor="#1C59B8" />
        <Stop offset={0.8} stopColor="#1B6AB6" />
        <Stop offset={0.8} stopColor="#1A80B3" />
        <Stop offset={0.9} stopColor="#199CB0" />
        <Stop offset={1} stopColor="#18BBAD" />
        <Stop offset={1} stopColor="#17D1AA" />
      </LinearGradient>
      <LinearGradient
        id="b"
        x1={241.9}
        x2={241.9}
        y1={244.6}
        y2={23}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#1D45BA" />
        <Stop offset={0.4} stopColor="#1D47BA" />
        <Stop offset={0.6} stopColor="#1D4EB9" />
        <Stop offset={0.7} stopColor="#1C59B8" />
        <Stop offset={0.8} stopColor="#1B6AB6" />
        <Stop offset={0.8} stopColor="#1A80B3" />
        <Stop offset={0.9} stopColor="#199CB0" />
        <Stop offset={1} stopColor="#18BBAD" />
        <Stop offset={1} stopColor="#17D1AA" />
      </LinearGradient>
      <LinearGradient
        id="c"
        x1={241.9}
        x2={241.9}
        y1={244.6}
        y2={23}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#1D45BA" />
        <Stop offset={0.4} stopColor="#1D47BA" />
        <Stop offset={0.6} stopColor="#1D4EB9" />
        <Stop offset={0.7} stopColor="#1C59B8" />
        <Stop offset={0.8} stopColor="#1B6AB6" />
        <Stop offset={0.8} stopColor="#1A80B3" />
        <Stop offset={0.9} stopColor="#199CB0" />
        <Stop offset={1} stopColor="#18BBAD" />
        <Stop offset={1} stopColor="#17D1AA" />
      </LinearGradient>
      <LinearGradient
        id="d"
        x1={241.9}
        x2={241.9}
        y1={244.6}
        y2={23}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#1D45BA" />
        <Stop offset={0.4} stopColor="#1D47BA" />
        <Stop offset={0.6} stopColor="#1D4EB9" />
        <Stop offset={0.7} stopColor="#1C59B8" />
        <Stop offset={0.8} stopColor="#1B6AB6" />
        <Stop offset={0.8} stopColor="#1A80B3" />
        <Stop offset={0.9} stopColor="#199CB0" />
        <Stop offset={1} stopColor="#18BBAD" />
        <Stop offset={1} stopColor="#17D1AA" />
      </LinearGradient>
      <LinearGradient
        id="e"
        x1={241.9}
        x2={241.9}
        y1={244.6}
        y2={23}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#1D45BA" />
        <Stop offset={0.4} stopColor="#1D47BA" />
        <Stop offset={0.6} stopColor="#1D4EB9" />
        <Stop offset={0.7} stopColor="#1C59B8" />
        <Stop offset={0.8} stopColor="#1B6AB6" />
        <Stop offset={0.8} stopColor="#1A80B3" />
        <Stop offset={0.9} stopColor="#199CB0" />
        <Stop offset={1} stopColor="#18BBAD" />
        <Stop offset={1} stopColor="#17D1AA" />
      </LinearGradient>
      <LinearGradient
        id="f"
        x1={112.2}
        x2={222.4}
        y1={158.7}
        y2={158.7}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#17D1AA" />
        <Stop offset={0.1} stopColor="#1ACBAF" />
        <Stop offset={0.4} stopColor="#21B8BC" />
        <Stop offset={0.6} stopColor="#2E9BD3" />
        <Stop offset={0.9} stopColor="#3F71F1" />
        <Stop offset={1} stopColor="#475FFF" />
      </LinearGradient>
      <LinearGradient
        id="g"
        x1={209.3}
        x2={209.3}
        y1={260.9}
        y2={39.3}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#1D45BA" />
        <Stop offset={0.4} stopColor="#1D47BA" />
        <Stop offset={0.6} stopColor="#1D4EB9" />
        <Stop offset={0.7} stopColor="#1C59B8" />
        <Stop offset={0.8} stopColor="#1B6AB6" />
        <Stop offset={0.8} stopColor="#1A80B3" />
        <Stop offset={0.9} stopColor="#199CB0" />
        <Stop offset={1} stopColor="#18BBAD" />
        <Stop offset={1} stopColor="#17D1AA" />
      </LinearGradient>
      <LinearGradient
        id="h"
        x1={209.3}
        x2={209.3}
        y1={260.9}
        y2={39.3}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#1D45BA" />
        <Stop offset={0.4} stopColor="#1D47BA" />
        <Stop offset={0.6} stopColor="#1D4EB9" />
        <Stop offset={0.7} stopColor="#1C59B8" />
        <Stop offset={0.8} stopColor="#1B6AB6" />
        <Stop offset={0.8} stopColor="#1A80B3" />
        <Stop offset={0.9} stopColor="#199CB0" />
        <Stop offset={1} stopColor="#18BBAD" />
        <Stop offset={1} stopColor="#17D1AA" />
      </LinearGradient>
      <LinearGradient
        id="i"
        x1={209.3}
        x2={209.3}
        y1={260.9}
        y2={39.3}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#1D45BA" />
        <Stop offset={0.4} stopColor="#1D47BA" />
        <Stop offset={0.6} stopColor="#1D4EB9" />
        <Stop offset={0.7} stopColor="#1C59B8" />
        <Stop offset={0.8} stopColor="#1B6AB6" />
        <Stop offset={0.8} stopColor="#1A80B3" />
        <Stop offset={0.9} stopColor="#199CB0" />
        <Stop offset={1} stopColor="#18BBAD" />
        <Stop offset={1} stopColor="#17D1AA" />
      </LinearGradient>
      <LinearGradient
        id="j"
        x1={209.3}
        x2={209.3}
        y1={260.9}
        y2={39.3}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#1D45BA" />
        <Stop offset={0.4} stopColor="#1D47BA" />
        <Stop offset={0.6} stopColor="#1D4EB9" />
        <Stop offset={0.7} stopColor="#1C59B8" />
        <Stop offset={0.8} stopColor="#1B6AB6" />
        <Stop offset={0.8} stopColor="#1A80B3" />
        <Stop offset={0.9} stopColor="#199CB0" />
        <Stop offset={1} stopColor="#18BBAD" />
        <Stop offset={1} stopColor="#17D1AA" />
      </LinearGradient>
      <LinearGradient
        id="k"
        x1={209.3}
        x2={209.3}
        y1={260.9}
        y2={39.3}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#1D45BA" />
        <Stop offset={0.4} stopColor="#1D47BA" />
        <Stop offset={0.6} stopColor="#1D4EB9" />
        <Stop offset={0.7} stopColor="#1C59B8" />
        <Stop offset={0.8} stopColor="#1B6AB6" />
        <Stop offset={0.8} stopColor="#1A80B3" />
        <Stop offset={0.9} stopColor="#199CB0" />
        <Stop offset={1} stopColor="#18BBAD" />
        <Stop offset={1} stopColor="#17D1AA" />
      </LinearGradient>
      <LinearGradient
        id="l"
        x1={79.6}
        x2={189.8}
        y1={175}
        y2={175}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#17D1AA" />
        <Stop offset={0.1} stopColor="#1ACBAF" />
        <Stop offset={0.4} stopColor="#21B8BC" />
        <Stop offset={0.6} stopColor="#2E9BD3" />
        <Stop offset={0.9} stopColor="#3F71F1" />
        <Stop offset={1} stopColor="#475FFF" />
      </LinearGradient>
      <LinearGradient
        id="m"
        x1={175.7}
        x2={175.7}
        y1={278.2}
        y2={56.6}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#1D45BA" />
        <Stop offset={0.4} stopColor="#1D47BA" />
        <Stop offset={0.6} stopColor="#1D4EB9" />
        <Stop offset={0.7} stopColor="#1C59B8" />
        <Stop offset={0.8} stopColor="#1B6AB6" />
        <Stop offset={0.8} stopColor="#1A80B3" />
        <Stop offset={0.9} stopColor="#199CB0" />
        <Stop offset={1} stopColor="#18BBAD" />
        <Stop offset={1} stopColor="#17D1AA" />
      </LinearGradient>
      <LinearGradient
        id="n"
        x1={175.7}
        x2={175.7}
        y1={278.2}
        y2={56.6}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#1D45BA" />
        <Stop offset={0.4} stopColor="#1D47BA" />
        <Stop offset={0.6} stopColor="#1D4EB9" />
        <Stop offset={0.7} stopColor="#1C59B8" />
        <Stop offset={0.8} stopColor="#1B6AB6" />
        <Stop offset={0.8} stopColor="#1A80B3" />
        <Stop offset={0.9} stopColor="#199CB0" />
        <Stop offset={1} stopColor="#18BBAD" />
        <Stop offset={1} stopColor="#17D1AA" />
      </LinearGradient>
      <LinearGradient
        id="o"
        x1={175.7}
        x2={175.7}
        y1={278.2}
        y2={56.6}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#1D45BA" />
        <Stop offset={0.4} stopColor="#1D47BA" />
        <Stop offset={0.6} stopColor="#1D4EB9" />
        <Stop offset={0.7} stopColor="#1C59B8" />
        <Stop offset={0.8} stopColor="#1B6AB6" />
        <Stop offset={0.8} stopColor="#1A80B3" />
        <Stop offset={0.9} stopColor="#199CB0" />
        <Stop offset={1} stopColor="#18BBAD" />
        <Stop offset={1} stopColor="#17D1AA" />
      </LinearGradient>
      <LinearGradient
        id="p"
        x1={175.7}
        x2={175.7}
        y1={278.2}
        y2={56.6}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#1D45BA" />
        <Stop offset={0.4} stopColor="#1D47BA" />
        <Stop offset={0.6} stopColor="#1D4EB9" />
        <Stop offset={0.7} stopColor="#1C59B8" />
        <Stop offset={0.8} stopColor="#1B6AB6" />
        <Stop offset={0.8} stopColor="#1A80B3" />
        <Stop offset={0.9} stopColor="#199CB0" />
        <Stop offset={1} stopColor="#18BBAD" />
        <Stop offset={1} stopColor="#17D1AA" />
      </LinearGradient>
      <LinearGradient
        id="q"
        x1={175.7}
        x2={175.7}
        y1={278.2}
        y2={56.6}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#1D45BA" />
        <Stop offset={0.4} stopColor="#1D47BA" />
        <Stop offset={0.6} stopColor="#1D4EB9" />
        <Stop offset={0.7} stopColor="#1C59B8" />
        <Stop offset={0.8} stopColor="#1B6AB6" />
        <Stop offset={0.8} stopColor="#1A80B3" />
        <Stop offset={0.9} stopColor="#199CB0" />
        <Stop offset={1} stopColor="#18BBAD" />
        <Stop offset={1} stopColor="#17D1AA" />
      </LinearGradient>
      <LinearGradient
        id="r"
        x1={46}
        x2={156.2}
        y1={192.3}
        y2={192.3}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#17D1AA" />
        <Stop offset={0.1} stopColor="#1ACBAF" />
        <Stop offset={0.4} stopColor="#21B8BC" />
        <Stop offset={0.6} stopColor="#2E9BD3" />
        <Stop offset={0.9} stopColor="#3F71F1" />
        <Stop offset={1} stopColor="#475FFF" />
      </LinearGradient>
    </Defs>
  </Svg>
)
export {QRs}
