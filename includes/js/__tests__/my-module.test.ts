import { SemanticWikiApi } from "../Semantic/semanticWikiApi";

// @ts-ignore
test('Contact MW server trying to load  data', () => {
  let p = SemanticWikiApi.BrowseBySubject("Abbandono dei principi giornalistici, nascita delle Fuck News ed episodi vari");
  // expect(p).toBe(3);
});

