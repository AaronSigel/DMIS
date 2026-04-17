package com.dmis.backend.architecture;

import com.tngtech.archunit.core.domain.Dependency;
import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchCondition;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.lang.ConditionEvents;
import com.tngtech.archunit.lang.SimpleConditionEvent;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

class ModuleBoundariesArchTest {

    private final JavaClasses classes = new ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
            .importPackages("com.dmis.backend");

    @Test
    void applicationDoesNotDependOnApiOrInfra() {
        ArchRule rule = noClasses()
                .that().resideInAPackage("com.dmis.backend..application..")
                .should().dependOnClassesThat()
                .resideInAnyPackage(
                        "com.dmis.backend..api..",
                        "com.dmis.backend..infra..",
                        "com.dmis.backend.adapters.."
                );

        rule.check(classes);
    }

    @Test
    void legacyRootPackagesAreForbidden() {
        ArchRule rule = classes()
                .that().resideInAnyPackage(
                        "com.dmis.backend.adapters..",
                        "com.dmis.backend.application..",
                        "com.dmis.backend.domain..",
                        "com.dmis.backend.infrastructure.."
                )
                .should().haveFullyQualifiedName("this.package.must.not.exist")
                .allowEmptyShould(true);

        rule.check(classes);
    }

    @Test
    void apiDependsOnApplicationSharedOrPlatformOnly() {
        ArchRule rule = classes()
                .that().resideInAPackage("com.dmis.backend..api..")
                .should().onlyDependOnClassesThat()
                .resideInAnyPackage(
                        "com.dmis.backend..api..",
                        "com.dmis.backend..application..",
                        "com.dmis.backend.shared..",
                        "com.dmis.backend.platform..",
                        "java..",
                        "javax..",
                        "jakarta..",
                        "org.springframework..",
                        "com.fasterxml.."
                );

        rule.check(classes);
    }

    @Test
    void infraDoesNotDependOnOtherModuleInfra() {
        ArchRule rule = noClasses()
                .that().resideInAPackage("com.dmis.backend..infra..")
                .should(new ArchCondition<>("depend on infra of another module") {
                    @Override
                    public void check(JavaClass origin, ConditionEvents events) {
                        String originModule = moduleOf(origin);
                        for (Dependency dependency : origin.getDirectDependenciesFromSelf()) {
                            JavaClass target = dependency.getTargetClass();
                            if (!target.getPackageName().contains(".infra.")) {
                                continue;
                            }
                            String targetModule = moduleOf(target);
                            if (!originModule.equals(targetModule)) {
                                String message = origin.getName() + " depends on " + target.getName();
                                events.add(SimpleConditionEvent.violated(dependency, message));
                            }
                        }
                    }
                });

        rule.check(classes);
    }

    @Test
    void infraDoesNotDependOnOtherModuleApi() {
        ArchRule rule = noClasses()
                .that().resideInAPackage("com.dmis.backend..infra..")
                .should(new ArchCondition<>("depend on api of another module") {
                    @Override
                    public void check(JavaClass origin, ConditionEvents events) {
                        String originModule = moduleOf(origin);
                        for (Dependency dependency : origin.getDirectDependenciesFromSelf()) {
                            JavaClass target = dependency.getTargetClass();
                            if (!target.getPackageName().contains(".api.")) {
                                continue;
                            }
                            String targetModule = moduleOf(target);
                            if (!originModule.equals(targetModule)) {
                                String message = origin.getName() + " depends on " + target.getName();
                                events.add(SimpleConditionEvent.violated(dependency, message));
                            }
                        }
                    }
                });

        rule.check(classes);
    }

    private static String moduleOf(JavaClass javaClass) {
        String prefix = "com.dmis.backend.";
        String packageName = javaClass.getPackageName();
        if (!packageName.startsWith(prefix)) {
            return "";
        }
        String tail = packageName.substring(prefix.length());
        int dot = tail.indexOf('.');
        return dot < 0 ? tail : tail.substring(0, dot);
    }
}
