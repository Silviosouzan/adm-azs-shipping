package azship.repository;

import azship.model.Freight;
import jakarta.persistence.criteria.*; // Importar tudo de criteria
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
// import jakarta.persistence.criteria.JoinType; // Não precisamos mais do JoinType explícito aqui

import java.util.ArrayList;
import java.util.List;

public class FreightSpecification {

    /**
     * Helper method para extrair valor JSONB como texto (mantido).
     */
    private static Expression<String> jsonValueAsText(Root<Freight> root, CriteriaBuilder builder, String key) {
        return builder.function(
                "jsonb_extract_path_text",
                String.class,
                root.get("properties"),
                builder.literal(key)
        );
    }

    // Não precisamos mais do helper jsonPropertiesAsText

    public static Specification<Freight> build(
            String searchTerm, String status, String propertyKey, String propertyValue
    ) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Filtro: Status (mantido)
            if (StringUtils.hasText(status)) {
                predicates.add(builder.equal(root.get("status"), status));
            }

            // 2. Filtro: Chave/Valor da Propriedade (JSONB - mantido)
            if (StringUtils.hasText(propertyKey)) {
                Expression<String> extractedValue = jsonValueAsText(root, builder, propertyKey);
                Predicate keyExistsPredicate = builder.isNotNull(extractedValue);

                if (StringUtils.hasText(propertyValue)) {
                    Predicate valueMatchesPredicate = builder.like(
                            builder.lower(extractedValue),
                            "%" + propertyValue.toLowerCase() + "%"
                    );
                    predicates.add(builder.and(keyExistsPredicate, valueMatchesPredicate));
                } else {
                    predicates.add(keyExistsPredicate);
                }
            } else if (StringUtils.hasText(propertyValue)) {
                System.out.println("WARN: Filtrar apenas por valor de propriedade JSONB não implementado diretamente, use a busca global.");
            }

            // --- CORREÇÃO NO FILTRO GLOBAL ---
            // 3. Filtro: Busca Global (SearchTerm)
            if (StringUtils.hasText(searchTerm)) {
                String term = "%" + searchTerm.toLowerCase() + "%";

                // Tenta usar .as(String.class) diretamente.
                // Hibernate pode traduzir isso para ::text no PostgreSQL.
                Expression<String> propertiesAsString = root.get("properties").as(String.class);

                Predicate searchPredicate = builder.or(
                        builder.like(builder.lower(root.get("clientName")), term),
                        builder.like(builder.lower(root.get("status")), term),
                        // Busca no JSONB usando .as(String.class)
                        builder.like(builder.lower(propertiesAsString), term)
                );
                predicates.add(searchPredicate);
            }
            // --- FIM DA CORREÇÃO ---

            // Combina predicados
            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }
}