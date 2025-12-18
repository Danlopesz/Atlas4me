package atlas4me.repository;

import atlas4me.entity.Country;
import atlas4me.entity.CountryFeature;
import atlas4me.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CountryFeatureRepository extends JpaRepository<CountryFeature, Long> {
    
    // O método correto no lugar correto!
    Optional<CountryFeature> findByCountryAndQuestion(Country country, Question question);

    // Query nativa ou JPQL para buscar o valor booleano direto
    @Query("SELECT cf.isTrue FROM CountryFeature cf WHERE cf.country.id = :countryId AND cf.question.id = :questionId")
    Boolean getFeatureValue(@Param("countryId") Long countryId, @Param("questionId") Long questionId);
}