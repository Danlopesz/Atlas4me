package atlas4me.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import atlas4me.entity.Country;

import java.util.Optional;
import java.util.List;

@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {

    Optional<Country> findByIsoCode(String isoCode);

    // Busca pelo nome em inglês
    Optional<Country> findByNameEn(String nameEn);

    // OU, busca pelo nome em português
    Optional<Country> findByNamePt(String namePt);

    List<Country> findByContinent(String continent);

    List<Country> findBysubContinent(String subContinent);

    // Query para pegar aleatório (sem checar active, pois todos são ativos)
    @Query(value = "SELECT * FROM countries ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Optional<Country> findRandomCountry();

}
