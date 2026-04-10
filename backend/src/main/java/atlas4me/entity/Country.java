package atlas4me.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "countries")
@Data // Cria automaticamente os Getters, Setters, toString, etc.
@NoArgsConstructor // Cria construtor vazio (obrigatório pro JPA)
@AllArgsConstructor // Cria construtor com todos os campos
public class Country {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name_en", nullable = false, unique = true)
    private String nameEn;

    @Column(name = "name_pt", nullable = false, unique = true)
    private String namePt;

    @Column(name = "iso_code", nullable = false, length = 3)
    private String isoCode; // Ex: "BRA", "ARG"

    @Column(name = "flag_url")
    private String flagUrl;

    // ... outros campos
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "continent")
    private String continent;

    @Column(name = "subcontinent")
    private String subContinent;

    @Column(name = "capital")
    private String capital;
}