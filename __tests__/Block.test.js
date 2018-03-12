import Block from '../Block';

describe('Test Block.js class', () => {
  it('should exist', () => {
    let block = new Block(0, 0, Date.now(), { example: 'testing' }, 0);
    expect(block).toBeTruthy();
  });
});
