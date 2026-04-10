package atlas4me.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CountryResponse {

    private Long id;
    private String namePt;
    private String nameEn;
    private String isoCode;
    private String continent;
    private String subContinent;
    private String capital;
    private String flagUrl;
}