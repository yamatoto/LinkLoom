import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import React from 'react'

// React をグローバルに設定（Vitest + jsdom 環境で必要）
global.React = React

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
