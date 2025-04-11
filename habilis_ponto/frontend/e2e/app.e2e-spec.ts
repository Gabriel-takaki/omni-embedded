import { CallcenterviewPage } from './app.po';

describe('callcenterview App', () => {
  let page: CallcenterviewPage;

  beforeEach(() => {
    page = new CallcenterviewPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
