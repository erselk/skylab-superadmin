import { render } from '@testing-library/react';
import React from 'react';

function DummyComponent() {
  return <div>Test bileşeni</div>;
}

describe('DummyComponent', () => {
  it('mesajı render eder', () => {
    const { getByText } = render(<DummyComponent />);
    expect(getByText('Test bileşeni')).toBeTruthy();
  });
});
