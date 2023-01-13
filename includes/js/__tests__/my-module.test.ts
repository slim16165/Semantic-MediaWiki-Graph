import { SemanticWikiApi } from "../Semantic/semanticWikiApi";
import { MyData } from "../Semantic/myData";

// @ts-ignore
test('Contact MW server trying to load  data', () => {
  let p = SemanticWikiApi.BrowseBySubject("Abbandono dei principi giornalistici, nascita delle Fuck News ed episodi vari");
  // expect(p).toBe(3);
});


test('load from JSON', () => {
  let wikiArticleTitle = "Abbandono dei principi giornalistici, nascita delle Fuck News ed episodi vari";
  let data : MyData = "{\"query\":{\"subject\":\"Abbandono_dei_principi_giornalistici,_nascita_delle_Fuck_News_ed_episodi_vari#0##\",\"data\":[{\"property\":\"_INST\",\"dataitem\":[{\"type\":9,\"item\":\"Polarizzazione#14##\"},{\"type\":9,\"item\":\"Social_network#14##\"},{\"type\":9,\"item\":\"Cancel_Culture#14##\"},{\"type\":9,\"item\":\"Episodio#14##\"},{\"type\":9,\"item\":\"Razzismo#14##\"}]},{\"property\":\"_MDAT\",\"dataitem\":[{\"type\":6,\"item\":\"1/2022/12/21/9/38/54/0\"}]},{\"property\":\"_SKEY\",\"dataitem\":[{\"type\":2,\"item\":\"Abbandono dei principi giornalistici, nascita delle Fuck News ed episodi vari\"}]}],\"serializer\":\"SMW\\\\Serializers\\\\SemanticDataSerializer\",\"version\":2}}"

  let p = SemanticWikiApi.BrowseBySubjectSuccessCallback_InitWikiArticle(wikiArticleTitle, data);
  // expect(p).toBe(3);
});



